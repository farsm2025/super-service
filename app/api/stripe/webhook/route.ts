import {NextResponse} from "next/server";
import {stripeClient,stripeTestEnabled} from "@/lib/stripe-config";
import {syncDeposit} from "@/lib/deposits";
import type Stripe from "stripe";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  if(!stripeTestEnabled())return NextResponse.json({error:"Disabled"},{status:404});
  const secret=process.env.STRIPE_WEBHOOK_SECRET;const signature=request.headers.get("stripe-signature");
  if(!secret || !signature)return NextResponse.json({error:"Webhook not configured"},{status:400});
  let event:Stripe.Event;
  try {event=stripeClient().webhooks.constructEvent(await request.text(),signature,secret);}catch{return NextResponse.json({error:"Invalid signature"},{status:400});}
  if(event.livemode)return NextResponse.json({error:"Live event refused"},{status:400});
  const supported=["payment_intent.amount_capturable_updated","payment_intent.succeeded","payment_intent.canceled","payment_intent.payment_failed","payment_intent.processing"];
  if(supported.includes(event.type)) {
    const intent=event.data.object as Stripe.PaymentIntent;
    if(intent.metadata.application!=="super-service" || intent.metadata.kind!=="truck_deposit")return NextResponse.json({received:true});
    try {
      // Fetch current state so delayed/repeated events never replay stale status.
      const current=await stripeClient().paymentIntents.retrieve(intent.id,{expand:["latest_charge"]});
      const row=await syncDeposit(current);
      // Retry if Stripe succeeded while the initial DB write was temporarily unavailable.
      if(!row)return NextResponse.json({error:"Payment not yet recorded"},{status:503});
    }catch{return NextResponse.json({error:"Retry later"},{status:503});}
  }
  return NextResponse.json({received:true});
}
