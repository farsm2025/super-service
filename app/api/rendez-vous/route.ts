import {NextResponse} from "next/server";
import {createAppointment} from "@/lib/appointments";
import {sendNewRequestEmail} from "@/lib/appointment-email";
import {isIsoDate,isValidEmail,requiredText} from "@/lib/validation";
import {rateLimit} from "@/lib/rate-limit";
export const dynamic="force-dynamic";
const allowedTypes=new Set(["visite","demenagement","nettoyage","travaux","livraison","debarras","autre"]);
export async function POST(request:Request){
  try{if(!rateLimit(request,"public-appointment",6,60*60*1000))return NextResponse.json({error:"Trop de demandes. Réessayez plus tard."},{status:429});const body=await request.json() as Record<string,unknown>;if(requiredText(body.website))return NextResponse.json({ok:true},{status:201});
    const input={name:requiredText(body.name,120),email:requiredText(body.email,180),phone:requiredText(body.phone,50),address:requiredText(body.address,300),requestType:requiredText(body.requestType,40),reason:requiredText(body.reason,2000),preferredDate:requiredText(body.preferredDate,10),preferredTimeStart:requiredText(body.preferredTimeStart,5),preferredTimeEnd:requiredText(body.preferredTimeEnd,5),alternateDate:requiredText(body.alternateDate,10),alternateTimeStart:requiredText(body.alternateTimeStart,5),alternateTimeEnd:requiredText(body.alternateTimeEnd,5),notes:requiredText(body.notes,2000)};
    if(!input.name||!isValidEmail(input.email)||!input.phone||!input.address||!allowedTypes.has(input.requestType)||!input.reason||!isIsoDate(input.preferredDate)||body.consent!==true)return NextResponse.json({error:"Veuillez vérifier les champs obligatoires."},{status:400});
    if(input.alternateDate&&!isIsoDate(input.alternateDate))return NextResponse.json({error:"La deuxième date n’est pas valide."},{status:400});
    const appointment=await createAppointment(input);try{await sendNewRequestEmail(appointment)}catch(error){console.error("Appointment notification failed",error)}return NextResponse.json({ok:true,id:appointment.id},{status:201});
  }catch(error){console.error("Appointment request failed",error);return NextResponse.json({error:"La demande n’a pas pu être enregistrée. Réessayez ou appelez-nous."},{status:500})}}
