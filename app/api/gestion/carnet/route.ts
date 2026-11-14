import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {createQuoteNote,listQuoteNotes,noteInput} from "@/lib/quote-notes";
export const dynamic="force-dynamic";
export async function GET(){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  try{return NextResponse.json({notes:await listQuoteNotes()},{headers:{"Cache-Control":"no-store"}})}
  catch(error){console.error("Quote list failed",error);return NextResponse.json({error:"Lecture impossible"},{status:500})}
}
export async function POST(request:Request){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  try{
    const body=await request.json() as Record<string,unknown>;
    const input=noteInput(body);
    if(!input.firstName&&!input.lastName)return NextResponse.json({error:"Indiquez un prénom ou un nom."},{status:400});
    if(!input.phone)return NextResponse.json({error:"Le numéro de téléphone est requis."},{status:400});
    if(input.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))return NextResponse.json({error:"E-mail invalide."},{status:400});
    const note=await createQuoteNote(input);
    return NextResponse.json({note},{status:201});
  }catch(error){console.error("Quote creation failed",error);return NextResponse.json({error:"Enregistrement impossible"},{status:500})}
}
