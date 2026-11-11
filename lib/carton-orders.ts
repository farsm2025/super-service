import {randomUUID} from "node:crypto";
import type Stripe from "stripe";
import {paymentDatabase,paymentOrigin,stripeClient} from "./stripe-config";
import {cartAmount,cartonCatalog,type CartonQuantities,validateCart} from "./carton-catalog";
import {verifyCartonSession} from "./carton-session";
import {orderToken} from "./order-token";
export type CartonOrder={id:string;request_id:string;quantities:CartonQuantities;amount:number;currency:string;stripe_session_id:string|null;status:"pending"|"paid"|"expired";created_at:string;customer_email:string|null};
export async function findOrder(id:string){const sql=paymentDatabase();const rows=await sql`SELECT * FROM carton_orders WHERE id=${id} LIMIT 1`;return (rows[0] as CartonOrder|undefined)||null;}
export async function createCartonCheckout(requestId:string,value:unknown){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))throw new Error("Invalid request ID");
  const quantities=validateCart(value),amount=cartAmount(quantities),sql=paymentDatabase();
  const rows=await sql`INSERT INTO carton_orders (id,request_id,quantities,amount) VALUES (${randomUUID()},${requestId},${JSON.stringify(quantities)}::jsonb,${amount}) ON CONFLICT (request_id) DO UPDATE SET request_id=EXCLUDED.request_id RETURNING *`;
  const order=rows[0] as CartonOrder;
  if(order.amount!==amount || order.quantities.standard!==quantities.standard || order.quantities.grand!==quantities.grand)throw new Error("Cart changed; start a new checkout");
  if(order.status!=="pending")throw new Error("Commande déjà terminée. Commencez un nouveau panier.");
  let session:Stripe.Checkout.Session;
  if(order.stripe_session_id)session=await stripeClient().checkout.sessions.retrieve(order.stripe_session_id);
  else {
    // Refuse late retries once Stripe's 24-hour idempotency retention could have elapsed.
    if(Date.now()-new Date(order.created_at).getTime()>23*3600*1000)throw new Error("Commande expirée. Commencez un nouveau panier.");
    const token=orderToken(order.id),origin=paymentOrigin();
    session=await stripeClient().checkout.sessions.create({
      mode:"payment",allowed_payment_method_types:["card"],
      line_items:cartonCatalog.filter(item=>quantities[item.id]>0).map(item=>({quantity:quantities[item.id],price_data:{currency:"chf",unit_amount:item.price,product_data:{name:`${item.name} — ${item.size}`}}})),
      metadata:{application:"super-service",kind:"cartons",order_id:order.id},
      success_url:`${origin}/commande/${token}`,cancel_url:`${origin}/commande/${token}?annule=1`,
    },{idempotencyKey:`cartons-${order.id}`});
  }
  await syncCartonOrder(session);
  if(session.status!=="open" || !session.url)throw new Error("Ce paiement est terminé. Consultez votre commande ou commencez un nouveau panier.");
  return {url:session.url};
}
export async function syncCartonOrder(session:Stripe.Checkout.Session){
  if(session.livemode || session.mode!=="payment" || session.metadata?.application!=="super-service" || session.metadata?.kind!=="cartons" || session.currency!=="chf")throw new Error("Invalid Checkout session");
  const order=await findOrder(session.metadata.order_id);
  if(!order)return null;
  verifyCartonSession(session,order);
  const status=session.payment_status==="paid"?"paid":session.status==="expired"?"expired":"pending";
  const sql=paymentDatabase();
  const rows=await sql`UPDATE carton_orders SET stripe_session_id=${session.id},status=CASE WHEN status='paid' OR (status='expired' AND ${status}='pending') THEN status ELSE ${status} END,customer_email=COALESCE(${session.customer_details?.email||null},customer_email),updated_at=now() WHERE id=${order.id} AND (stripe_session_id IS NULL OR stripe_session_id=${session.id}) RETURNING *`;
  return (rows[0] as CartonOrder|undefined)||null;
}
export async function refreshCartonOrder(order:CartonOrder){return order.stripe_session_id?(await syncCartonOrder(await stripeClient().checkout.sessions.retrieve(order.stripe_session_id)))||order:order;}
export function orderView(order:CartonOrder){return {id:order.id,quantities:order.quantities,amount:order.amount,status:order.status};}
export async function listCartonOrders(){const sql=paymentDatabase();return await sql`SELECT * FROM carton_orders ORDER BY created_at DESC LIMIT 100` as CartonOrder[];}
