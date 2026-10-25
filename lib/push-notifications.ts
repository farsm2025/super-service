import webpush, {type PushSubscription} from "web-push";
import {database} from "./db";

type DueReminder={
  appointment_id:string;
  customer_name:string;
  customer_address:string;
  starts_at:string;
  subscription_id:string;
  subscription:PushSubscription;
  reminder_kind:"day"|"hour";
  delivery_key:string;
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
    body:"Ce téléphone recevra deux rappels : environ 24 heures avant, puis entre 1 et 2 heures avant chaque rendez-vous.",
    url:"/gestion",
    tag:"super-service-push-activation",
  }),{TTL:60*10,urgency:"high"});
}

function reminderBody(row:DueReminder){
  const dateAndTime=new Intl.DateTimeFormat("fr-CH",{timeZone:"Europe/Zurich",weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).format(new Date(row.starts_at));
  return `${row.customer_name} · ${dateAndTime} · ${row.customer_address}`;
}

export async function sendDueAppointmentReminders(){
  configureWebPush();
  const sql=database();
  // One hourly query handles both reminders. The 24h key remains the appointment
  // start time, preserving all existing delivery records; the short reminder uses
  // start minus one hour as a distinct key in the existing unique constraint.
  const rows=await sql.query(`
    SELECT a.id AS appointment_id,
           a.customer_name,
           a.customer_address,
           a.starts_at,
           s.id AS subscription_id,
           s.subscription,
           CASE WHEN a.starts_at > now() + interval '2 hours'
             THEN 'day' ELSE 'hour' END AS reminder_kind,
           CASE WHEN a.starts_at > now() + interval '2 hours'
             THEN a.starts_at ELSE a.starts_at - interval '1 hour' END AS delivery_key
    FROM appointments a
    CROSS JOIN push_subscriptions s
    LEFT JOIN appointment_push_deliveries d
      ON d.appointment_id = a.id
      AND d.subscription_id = s.id
      AND d.scheduled_for = CASE WHEN a.starts_at > now() + interval '2 hours'
        THEN a.starts_at ELSE a.starts_at - interval '1 hour' END
    WHERE a.status IN ('confirmed','modified')
      AND a.starts_at > now() + interval '1 hour'
      AND a.starts_at <= now() + interval '24 hours'
      AND d.id IS NULL
    ORDER BY a.starts_at
    LIMIT 100
  `,[]) as DueReminder[];
  let sent=0;
  let failed=0;
  for(const row of rows){
    const claimed=await sql.query(`INSERT INTO appointment_push_deliveries (appointment_id,subscription_id,scheduled_for) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id`,[row.appointment_id,row.subscription_id,row.delivery_key]);
    if(!claimed[0])continue;
    try{
      await webpush.sendNotification(row.subscription,JSON.stringify({
        title:row.reminder_kind==="day"?"Rendez-vous à venir":"Rendez-vous dans 1 à 2 heures",
        body:reminderBody(row),
        url:`/gestion?demande=${row.appointment_id}`,
        tag:`appointment-${row.appointment_id}-${row.starts_at}-${row.reminder_kind}`,
      }),{TTL:60*60,urgency:"high"});
      sent+=1;
    }catch(error){
      failed+=1;
      const statusCode=typeof error==="object"&&error&&"statusCode" in error?Number(error.statusCode):0;
      if(statusCode===404||statusCode===410)await sql.query("DELETE FROM push_subscriptions WHERE id=$1",[row.subscription_id]);
      else await sql.query("DELETE FROM appointment_push_deliveries WHERE appointment_id=$1 AND subscription_id=$2 AND scheduled_for=$3",[row.appointment_id,row.subscription_id,row.delivery_key]);
      console.error("Appointment push reminder failed",{appointmentId:row.appointment_id,subscriptionId:row.subscription_id,statusCode});
    }
  }
  return {checked:rows.length,sent,failed};
}

export type {PushSubscription};
