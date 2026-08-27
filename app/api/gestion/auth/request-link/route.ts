import {NextResponse} from "next/server";
import {createMagicLink} from "@/lib/admin-auth";
import {sendMagicLinkEmail} from "@/lib/appointment-email";
import {rateLimit} from "@/lib/rate-limit";
import {safeSiteOrigin} from "@/lib/site";
export const dynamic="force-dynamic";
export async function POST(request:Request){try{if(!rateLimit(request,"admin-login",3,15*60*1000))return NextResponse.json({error:"Veuillez attendre avant de redemander un lien."},{status:429});const body=await request.json().catch(()=>({})) as {appointmentId?:string};const appointmentId=/^[0-9a-f-]{36}$/i.test(body.appointmentId||"")?body.appointmentId:undefined;const token=await createMagicLink();await sendMagicLinkEmail(token,safeSiteOrigin(request.url),appointmentId);return NextResponse.json({ok:true})}catch(error){console.error("Admin login email failed",error);return NextResponse.json({error:"Impossible d’envoyer le lien de connexion."},{status:500})}}
