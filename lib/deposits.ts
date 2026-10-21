import {randomUUID} from "node:crypto";
import type Stripe from "stripe";
import {paymentDatabase,stripeClient,paymentOrigin} from "./stripe-config";
import {depositToken,verifyDepositToken} from "./deposit-token";

export type Deposit = {id:string;appointment_id:string;stripe_payment_intent_id:string|null;status:string;captured_amount:number;capture_before:string|null;link_expires_at:string;operation:"capture"|"release"|null;intent_started_at:string|null};
async function find(id:string) {const sql=paymentDatabase();const rows=await sql`SELECT * FROM payments WHERE id=${id}::uuid`;return rows[0] as Deposit|undefined;}
export async function findAppointmentDeposit(appointmentId:string) {const sql=paymentDatabase();const rows=await sql`SELECT * FROM payments WHERE appointment_id=${appointmentId}`;return rows[0] as Deposit|undefined;}
export function depositView(row:Deposit) {return {id:row.id,status:row.status,amount:10000,capturedAmount:row.captured_amount,captureBefore:row.capture_before,operation:row.operation,linkExpired:new Date(row.link_expires_at).getTime()<=Date.now()};}
export function depositLink(row:Deposit) {return `${paymentOrigin()}/paiement/caution/${depositToken(row.id)}`;}

export async function syncDeposit(intent:Stripe.PaymentIntent) {
  if (intent.livemode || intent.metadata.application!=="super-service" || intent.metadata.kind!=="truck_deposit") throw new Error("Unexpected Stripe payment");
  if (intent.amount!==10000 || intent.currency!=="chf" || intent.capture_method!=="manual") throw new Error("Invalid deposit amount or mode");
  const charge=typeof intent.latest_charge==="object"?intent.latest_charge:null;
  const expiry=charge?.payment_method_details?.card?.capture_before;
  const status=intent.status==="requires_capture"?"authorized":intent.status==="succeeded"?"captured":intent.status==="canceled"?(intent.cancellation_reason==="requested_by_customer"?"released":"expired"):"pending";
  const sql=paymentDatabase();
  const rows=await sql`UPDATE payments SET status=${status},captured_amount=${intent.amount_received},capture_before=${expiry?new Date(expiry*1000).toISOString():null}::timestamptz,updated_at=now() WHERE stripe_payment_intent_id=${intent.id} AND id=${intent.metadata.payment_id}::uuid AND (status NOT IN ('captured','released','expired') OR status=${status}) AND (status='pending' OR ${status}<>'pending') RETURNING *`;
  return rows[0] as Deposit|undefined;
}
export async function refreshDeposit(row:Deposit) {
  if (!row.stripe_payment_intent_id) return row;
  const intent=await stripeClient().paymentIntents.retrieve(row.stripe_payment_intent_id,{expand:["latest_charge"]});
  return (await syncDeposit(intent))||row;
}
export async function createDeposit(appointmentId:string) {
  const sql=paymentDatabase();
  const rows=await sql`INSERT INTO payments (id,appointment_id) VALUES (${randomUUID()}::uuid,${appointmentId}) ON CONFLICT (appointment_id) DO UPDATE SET appointment_id=EXCLUDED.appointment_id RETURNING *`;
  const row=rows[0] as Deposit;
  return refreshDeposit(row);
}
export async function customerDeposit(token:string) {
  const id=verifyDepositToken(token);if(!id) return null;
  const row=await find(id);if(!row) return null;
  return row;
}
export async function prepareDepositIntent(row:Deposit) {
  if (new Date(row.link_expires_at).getTime()<=Date.now()) throw new Error("Deposit link expired");
  const stripe=stripeClient();
  if (row.stripe_payment_intent_id) return stripe.paymentIntents.retrieve(row.stripe_payment_intent_id,{expand:["latest_charge"]});
  const sql=paymentDatabase();
  const started=await sql`UPDATE payments SET intent_started_at=COALESCE(intent_started_at,now()) WHERE id=${row.id}::uuid RETURNING intent_started_at,stripe_payment_intent_id`;
  if (started[0].stripe_payment_intent_id) return stripe.paymentIntents.retrieve(String(started[0].stripe_payment_intent_id),{expand:["latest_charge"]});
  // Stripe retains idempotency keys for >=24h. Never create a second hold after that window.
  if (Date.now()-new Date(String(started[0].intent_started_at)).getTime()>23*3600000) throw new Error("Manual reconciliation required");
  const intent=await stripe.paymentIntents.create({amount:10000,currency:"chf",capture_method:"manual",allowed_payment_method_types:["card"],description:"Super Service – caution camion (test)",metadata:{application:"super-service",kind:"truck_deposit",payment_id:row.id}}, {idempotencyKey:`deposit-${row.id}`});
  await sql`UPDATE payments SET stripe_payment_intent_id=${intent.id},updated_at=now() WHERE id=${row.id}::uuid AND stripe_payment_intent_id IS NULL`;
  return intent;
}
export async function actOnDeposit(row:Deposit,action:"capture"|"release") {
  if (!row.stripe_payment_intent_id) throw new Error("No authorization");
  const sql=paymentDatabase();
  // Reserve the decision atomically. Retries may repeat the SAME operation only.
  const claimed=await sql`UPDATE payments SET operation=${action},updated_at=now() WHERE id=${row.id}::uuid AND status='authorized' AND (operation IS NULL OR operation=${action}) RETURNING *`;
  if (!claimed[0]) throw new Error("Deposit unavailable or another decision already reserved");
  const stripe=stripeClient();
  const current=await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id,{expand:["latest_charge"]});
  if (current.status!=="requires_capture") {await syncDeposit(current);return refreshDeposit(row);}
  const expiry=typeof current.latest_charge==="object"?current.latest_charge?.payment_method_details?.card?.capture_before:undefined;
  if (action==="capture" && expiry && expiry*1000<=Date.now()) throw new Error("Authorization expired");
  const result=action==="capture"?await stripe.paymentIntents.capture(current.id,{amount_to_capture:10000},{idempotencyKey:`capture-${row.id}`}):await stripe.paymentIntents.cancel(current.id,{cancellation_reason:"requested_by_customer"},{idempotencyKey:`release-${row.id}`});
  await syncDeposit(result);return refreshDeposit(row);
}
