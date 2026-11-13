import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {addQuotePhoto,getQuoteNote} from "@/lib/quote-notes";
export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  if(!await getQuoteNote(id))return NextResponse.json({error:"Fiche introuvable"},{status:404});
  try{
    if(Number(request.headers.get("content-length")||0)>750_000)return NextResponse.json({error:"Photo trop volumineuse"},{status:413});
    const form=await request.formData();
    const file=form.get("photo");
    if(!(file instanceof File))return NextResponse.json({error:"Fichier manquant"},{status:400});
    if(file.size===0||file.size>450_000)return NextResponse.json({error:"Photo trop volumineuse (maximum 450 Ko)"},{status:413});
    if(!["image/jpeg","image/png","image/webp"].includes(file.type))return NextResponse.json({error:"Seules les photos JPEG, PNG ou WebP sont acceptées"},{status:400});
    const buffer=await file.arrayBuffer();
    const bytes=new Uint8Array(buffer.slice(0,12));
    const valid=(file.type==="image/jpeg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)
      ||(file.type==="image/png"&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)
      ||(file.type==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP");
    if(!valid)return NextResponse.json({error:"Le contenu du fichier ne correspond pas à une image valide"},{status:400});
    const photoId=await addQuotePhoto(id,buffer,file.type,file.name.slice(0,180));
    return NextResponse.json({photoId},{status:201});
  }catch(error){console.error("Quote photo upload failed",error);return NextResponse.json({error:"Envoi impossible : vérifiez la capacité disponible du carnet"},{status:500})}
}
