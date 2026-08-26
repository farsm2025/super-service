import {createPendingReview,sendReviewVerification} from "../../../lib/reviews";

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,string>;
    if(body.website)return Response.json({ok:true});
    const rating=Number(body.rating);
    if(!body.name?.trim()||!emailPattern.test(body.email?.trim()||"")||!body.service?.trim()||!body.comment?.trim()||body.consent!=="yes"||body.comment.trim().length<20||body.comment.length>3000||!Number.isInteger(rating)||rating<1||rating>5){
      return Response.json({message:"Informations manquantes ou invalides"},{status:400});
    }
    const token=crypto.randomUUID();
    await createPendingReview({...body,token});
    await sendReviewVerification({...body,token});
    return Response.json({ok:true});
  }catch(error){
    console.error("Review submission failed",error);
    return Response.json({message:"Service indisponible"},{status:500});
  }
}
