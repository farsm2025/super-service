import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {removePushSubscription,savePushSubscription,sendPushActivationConfirmation,vapidPublicKey,type PushSubscription} from "@/lib/push-notifications";

export const dynamic="force-dynamic";
export const runtime="nodejs";

async function authorized(){return Boolean(await getAdminSession())}

export async function GET(){
  if(!await authorized())return NextResponse.json({error:"Non autorisé"},{status:401});
  return NextResponse.json({publicKey:vapidPublicKey(),reminderMinutes:60});
}

export async function POST(request:Request){
  if(!await authorized())return NextResponse.json({error:"Non autorisé"},{status:401});
  try{
    const body=await request.json() as {subscription?:PushSubscription};
    if(!body.subscription)return NextResponse.json({error:"Abonnement manquant"},{status:400});
    await savePushSubscription(body.subscription);
    await sendPushActivationConfirmation(body.subscription);
    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Push subscription failed",error);
    return NextResponse.json({error:"Impossible d’activer les rappels"},{status:500});
  }
}

export async function DELETE(request:Request){
  if(!await authorized())return NextResponse.json({error:"Non autorisé"},{status:401});
  try{
    const body=await request.json() as {endpoint?:string};
    await removePushSubscription(body.endpoint||"");
    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Push unsubscription failed",error);
    return NextResponse.json({error:"Impossible de désactiver les rappels"},{status:500});
  }
}
