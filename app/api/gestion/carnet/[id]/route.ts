import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {getQuoteNote,noteInput,updateQuoteNote,linkQuoteAppointment} from "@/lib/quote-notes";
export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(_:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  try{const note=await getQuoteNote(id);return note?NextResponse.json({note}):NextResponse.json({error:"Introuvable"},{status:404})}
  catch{return NextResponse.json({error:"Lecture impossible"},{status:500})}
}
export async function PATCH(request:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  try{
    const body=await request.json() as Record<string,unknown>;
    if(body.action==="link_appointment"){
      const appointmentId=typeof body.appointmentId==="string"?body.appointmentId:null;
      if(appointmentId&&!uuid.test(appointmentId))return NextResponse.json({error:"Identifiant de rendez-vous invalide"},{status:400});
      const note=await linkQuoteAppointment(id,appointmentId);return note?NextResponse.json({note}):NextResponse.json({error:"Introuvable"},{status:404});
    }
    const input=noteInput(body);
    if((!input.firstName&&!input.lastName)||!input.phone)return NextResponse.json({error:"Nom et téléphone requis"},{status:400});
    const note=await updateQuoteNote(id,input);
    return note?NextResponse.json({note}):NextResponse.json({error:"Introuvable"},{status:404});
  }catch(error){console.error("Quote update failed",error);return NextResponse.json({error:"Modification impossible"},{status:500})}
}
