import type Stripe from "stripe";
export function verifyCartonSession(session:Stripe.Checkout.Session,order:{id:string;amount:number;stripe_session_id:string|null}){
  if(session.livemode || session.mode!=="payment" || session.metadata?.application!=="super-service" || session.metadata?.kind!=="cartons" || session.metadata?.order_id!==order.id || session.currency!=="chf" || session.amount_total!==order.amount || (order.stripe_session_id && order.stripe_session_id!==session.id))throw new Error("Session does not match test order");
  if(session.payment_status==="paid" && session.status!=="complete")throw new Error("Incomplete paid session");
}
