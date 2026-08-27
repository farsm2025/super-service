import {NextResponse} from "next/server";
import {getPendingCustomerProposal} from "@/lib/appointment-confirmation";
import {sendAppointmentStatusEmail,sendCustomerAcceptedEmail} from "@/lib/appointment-email";
import {confirmCustomerProposal} from "@/lib/appointments";
import {syncGoogleCalendar} from "@/lib/google-calendar";
import {rateLimit} from "@/lib/rate-limit";
import {requiredText} from "@/lib/validation";

export const dynamic="force-dynamic";
export const runtime="nodejs";

export async function POST(request:Request){
  try{
    if(!rateLimit(request,"customer-appointment-confirmation",10,60*60*1000))return NextResponse.json({error:"Trop de tentatives. Réessayez plus tard."},{status:429});
    const body=await request.json() as {token?:unknown};const token=requiredText(body.token,2000);const pending=token?await getPendingCustomerProposal(token):null;
    if(!pending)return NextResponse.json({error:"Ce lien n’est plus valable ou cette date a déjà été traitée."},{status:400});
    const appointment=await confirmCustomerProposal(pending.appointment.id,pending.payload.startsAt);
    let calendarSynced=false;try{calendarSynced=(await syncGoogleCalendar(appointment)).synced}catch(error){console.error("Customer confirmation calendar sync failed",error)}
    try{await Promise.all([sendAppointmentStatusEmail(appointment,"confirmed"),sendCustomerAcceptedEmail(appointment)])}catch(error){console.error("Customer confirmation email failed",error)}
    return NextResponse.json({ok:true,appointment,calendarSynced});
  }catch(error){console.error("Customer appointment confirmation failed",error);return NextResponse.json({error:"La confirmation n’a pas pu être enregistrée."},{status:400})}
}
