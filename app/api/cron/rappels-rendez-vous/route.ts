import {NextResponse} from "next/server";
import {sendDueAppointmentReminders} from "@/lib/push-notifications";

export const dynamic="force-dynamic";
export const runtime="nodejs";

export async function GET(request:Request){
  if(!process.env.CRON_SECRET||request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return new NextResponse("Unauthorized",{status:401});
  try{
    const result=await sendDueAppointmentReminders();
    console.log("Appointment reminders completed",result);
    return NextResponse.json({ok:true,...result});
  }catch(error){
    console.error("Appointment reminders cron failed",error);
    return NextResponse.json({error:"Reminder job failed"},{status:500});
  }
}
