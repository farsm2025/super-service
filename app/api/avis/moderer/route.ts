import {moderateReview,ReviewAction,verifyModerationLink} from "../../../../lib/reviews";

export async function POST(request:Request){
  const form=await request.formData();
  const review=String(form.get("review")||"");
  const action=String(form.get("action")||"");
  const expires=String(form.get("expires")||"");
  const signature=String(form.get("signature")||"");
  const destination=new URL("/avis/moderer",request.url);
  try{
    const valid=await verifyModerationLink(review,action,expires,signature);
    if(!valid){destination.searchParams.set("result","invalid");return Response.redirect(destination,303)}
    await moderateReview(review,action as ReviewAction);
    destination.searchParams.set("result",action);
    return Response.redirect(destination,303);
  }catch(error){
    console.error("Review moderation failed",error);
    destination.searchParams.set("result","error");
    return Response.redirect(destination,303);
  }
}
