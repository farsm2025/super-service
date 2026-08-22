import {validateReview} from "../../../../lib/reviews";
export async function GET(req:Request){const token=new URL(req.url).searchParams.get("token");if(!token)return new Response("Lien invalide",{status:400});const ok=await validateReview(token);return Response.redirect(new URL(ok?"/avis?validation=ok":"/avis?validation=erreur",req.url))}
