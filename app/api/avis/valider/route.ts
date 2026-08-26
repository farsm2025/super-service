import {validateReview} from "../../../../lib/reviews";
export async function GET(req:Request){
  const token=new URL(req.url).searchParams.get("token");
  if(!token)return new Response("Lien invalide",{status:400});
  try{
    const ok=await validateReview(token);
    return Response.redirect(new URL(ok?"/avis?validation=ok":"/avis?validation=erreur",req.url));
  }catch(error){
    console.error("Review validation failed",error);
    return Response.redirect(new URL("/avis?validation=erreur",req.url));
  }
}
