import {sendEndOfJobReviewRequest} from "@/lib/reviews";

export async function POST(req:Request){
  try{
    const body=await req.json() as Record<string,string>;
    const name=body.name?.trim();
    const email=body.email?.trim().toLowerCase();
    if(!name||!email)return Response.json({message:"Nom et adresse e-mail requis"},{status:400});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({message:"Adresse e-mail invalide"},{status:400});
    await sendEndOfJobReviewRequest({name,email});
    return Response.json({ok:true});
  }catch(error){
    console.error("End-of-job review request failed",error);
    return Response.json({message:"L’envoi de l’e-mail a échoué. Veuillez réessayer."},{status:500});
  }
}
