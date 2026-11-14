import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {getAppointment} from "@/lib/appointments";
import {database} from "@/lib/db";
import {isValidEmail} from "@/lib/validation";
import {manualEmailStatus,sendTrackedManualConfirmation} from "@/lib/manual-appointment-email-status";

export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findLinkedAppointment(id:string){
  if(!uuid.test(id))return null;
  const sql=database();
  const rows=await sql.query("SELECT id FROM quote_notes WHERE appointment_id=$1 LIMIT 1",[id]);
  if(!rows.length)return null;
  const appointment=await getAppointment(id);
  return appointment?.source==="manual"?appointment:null;
}

export async function GET(_:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {id}=await params;
  if(!uuid.test(id))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  try{
    const appointment=await findLinkedAppointment(id);
    if(!appointment)return NextResponse.json({error:"Rendez-vous introuvable ou non associé"},{status:404});
    const emailStatus=await manualEmailStatus(id);
    return NextResponse.json({emailStatus},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("Confirmation status failed",error);return NextResponse.json({error:"Statut indisponible"},{status:500})}
}

export async function POST(_:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {id}=await params;
  if(!uuid.test(id))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  try{
    const appointment=await findLinkedAppointment(id);
    if(!appointment)return NextResponse.json({error:"Rendez-vous introuvable ou non associé"},{status:404});
    if(appointment.status!=="confirmed"||!appointment.startsAt||!isValidEmail(appointment.customerEmail))
      return NextResponse.json({error:"Rendez-vous non confirmé ou e-mail invalide"},{status:400});
    const previous=await manualEmailStatus(id);
    if(previous!=="failed")return NextResponse.json({error:"Renvoi non disponible : aucun échec d'envoi confirmé"},{status:409});
    if(process.env.VERCEL_ENV==="preview")return NextResponse.json({emailStatus:"skipped",emailSent:false});
    const emailStatus=await sendTrackedManualConfirmation(appointment);
    return NextResponse.json({emailStatus,emailSent:emailStatus==="sent"});
  }catch(error){console.error("Confirmation retry failed",error);return NextResponse.json({error:"Renvoi impossible"},{status:500})}
}
