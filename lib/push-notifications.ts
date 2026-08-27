import webpush, {type PushSubscription} from "web-push";
import {database} from "./db";

type DueReminder={
  appointment_id:string;
  customer_name:string;
  customer_address:string;
  starts_at:string;
  subscription_id:string;
  subscription:PushSubscription;
};

export function vapidPublicKey(){
  const key=process.env.VAPID_PUBLIC_KEY;
  if(!key)throw new Error("VAPID_PUBLIC_KEY is missing");
  return key;
}

function configureWebPush(){
  const publicKey=vapidPublicKey();
  const privateKey=process.env.VAPID_PRIVATE_KEY;
  if(!privateKey)throw new Error("VAPID_PRIVATE_KEY is missing");
  webpush.setVapidDetails("mailto:info@super-service.ch",publicKey,privateKey);
}

export async function savePushSubscription(subscription:PushSubscription){
  if(!subscription?.endpoint?.startsWith("https://")||!subscription.keys?.p256dh||!subscription.keys?.auth)throw new Error("Invalid push subscription");
  const sql=database();
  const stored=JSON.stringify(subscription);
  await sql.query(`INSERT INTO push_subscriptions (endpoint,subscription,updated_at) VALUES ($1,$2::jsonb,now()) ON CONFLICT (endpoint) DO UPDATE SET subscription=EXCLUDED.subscription,updated_at=now()`,[subscription.endpoint,stored]);
}

export async function removePushSubscription(endpoint:string){
  if(!endpoint)return;
  const sql=database();
  await sql.query("DELETE FROM push_subscriptions WHERE endpoint=$1",[endpoint]);
}

export async function sendPushActivationConfirmation(subscription:PushSubscription){
  configureWebPush();
  await webpush.sendNotification(subscription,JSON.stringify({
    title:"Rappels Super-Service activés",
    body:"Ce téléphone recevra une notification une heure avant chaque rendez-vous.",
    url:"/gestion",
    tag:"super-service-push-activation",
  }),{TTL:60*10,urgency:"high"});
}

function reminderBody(row:DueReminder){
  const time=new Intl.DateTimeFormat("fr-CH",{timeZone:"Europe/Zurich",hour:"2-digit",minute:"2-digit"}).format(new Date(row.starts_at));
  return `${row.customer_name} · ${time} · ${row.customer_address}`;
}

export async function sendDueAppointmentReminders(){
  configureWebPush();
  const sql=database();
  const rows=await sql.query(`SELECT a.id AS appointment_id,a.customer_name,a.customer_address,a.starts_at,s.id AS subscription_id,s.subscription FROM appointments a CROSS JOIN push_subscriptions s LEFT JOIN appointment_push_deliveries d ON d.appointment_id=a.id AND d.subscription_id=s.id AND d.scheduled_for=a.starts_at WHERE a.status IN ('confirmed','modified') AND a.starts_at>now() AND a.starts_at<=now()+interval '60 minutes' AND d.id IS NULL ORDER BY a.starts_at LIMIT 100`,[]) as DueReminder[];
  let sent=0;
  let failed=0;
  for(const row of rows){
    const claimed=await sql.query(`INSERT INTO appointment_push_deliveries (appointment_id,subscription_id,scheduled_for) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id`,[row.appointment_id,row.subscription_id,row.starts_at]);
    if(!claimed[0])continue;
    try{
      await webpush.sendNotification(row.subscription,JSON.stringify({title:"Rendez-vous dans 1 heure",body:reminderBody(row),url:`/gestion?demande=${row.appointment_id}`,tag:`appointment-${row.appointment_id}-${row.starts_at}`}),{TTL:60*60,urgency:"high"});
      sent+=1;
    }catch(error){
      failed+=1;
      const statusCode=typeof error==="object"&&error&&"statusCode" in error?Number(error.statusCode):0;
      if(statusCode===404||statusCode===410)await sql.query("DELETE FROM push_subscriptions WHERE id=$1",[row.subscription_id]);
      else await sql.query("DELETE FROM appointment_push_deliveries WHERE appointment_id=$1 AND subscription_id=$2 AND scheduled_for=$3",[row.appointment_id,row.subscription_id,row.starts_at]);
      console.error("Appointment push reminder failed",{appointmentId:row.appointment_id,subscriptionId:row.subscription_id,statusCode});
    }
  }
  return {checked:rows.length,sent,failed};
}

export type {PushSubscription};
