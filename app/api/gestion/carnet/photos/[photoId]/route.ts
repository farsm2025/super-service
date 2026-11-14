import {NextResponse} from "next/server";
import {getAdminSession} from "@/lib/admin-auth";
import {getPhotoRecord,readQuotePhoto,updateQuotePhotoCaption} from "@/lib/quote-notes";
export const dynamic="force-dynamic";
type Context={params:Promise<{photoId:string}>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(_:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {photoId}=await params;if(!uuid.test(photoId))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  const photo=await getPhotoRecord(photoId);
  if(!photo)return NextResponse.json({error:"Photo introuvable"},{status:404});
  try{
    const original=await readQuotePhoto(photoId);
    if(!original)return NextResponse.json({error:"Photo introuvable"},{status:404});
    const type=original.mime_type;
    return new Response(Buffer.from(original.base64,"base64"),{headers:{"Content-Type":type,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
  }catch(error){console.error("Photo read failed",error);return NextResponse.json({error:"Photo indisponible"},{status:502})}
}
export async function PATCH(request:Request,{params}:Context){
  if(!await getAdminSession())return NextResponse.json({error:"Non autorisé"},{status:401});
  const {photoId}=await params;if(!uuid.test(photoId))return NextResponse.json({error:"Identifiant invalide"},{status:400});
  try{
    const body=await request.json() as {caption?:unknown};
    const caption=typeof body.caption==="string"?body.caption.trim().slice(0,200):"";
    const ok=await updateQuotePhotoCaption(photoId,caption);
    return ok?NextResponse.json({ok:true}):NextResponse.json({error:"Photo introuvable"},{status:404});
  }catch{return NextResponse.json({error:"Modification impossible"},{status:500})}
}
