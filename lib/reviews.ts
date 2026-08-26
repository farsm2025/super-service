import {SITE_URL} from "./site";

const project=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID||"hk158c3c";
const dataset=process.env.NEXT_PUBLIC_SANITY_DATASET||"production";
const sanityToken=process.env.SANITY_API_TOKEN;
const resend=process.env.RESEND_API_KEY;
const origin=process.env.SITE_URL||SITE_URL;
const emailFrom=process.env.EMAIL_FROM||"Super-Service <devis@mail.super-service.ch>";
const emailTo=process.env.EMAIL_TO||"info@super-service.ch";
const moderationSecret=process.env.REVIEW_MODERATION_SECRET||sanityToken;
const moderationLifetime=7*24*60*60;

export type ReviewStatus="pending"|"verified"|"published"|"rejected"|"hidden";
export type ReviewAction=Extract<ReviewStatus,"published"|"rejected"|"hidden">;
export type ReviewRecord={_id:string;name:string;email?:string;service:string;rating:number;comment:string;status:ReviewStatus};

function requireSanity(){
  if(!project||!sanityToken)throw new Error("Sanity review configuration is missing");
}

async function sanityMutate(mutations:unknown[]){
  requireSanity();
  const response=await fetch(`https://${project}.api.sanity.io/v2026-03-01/data/mutate/${dataset}`,{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${sanityToken}`},
    body:JSON.stringify({mutations}),
  });
  if(!response.ok)throw new Error(`Sanity mutation failed (${response.status})`);
}

async function sanityQuery<T>(query:string,params:Record<string,string>={}):Promise<T>{
  requireSanity();
  const url=new URL(`https://${project}.api.sanity.io/v2026-03-01/data/query/${dataset}`);
  url.searchParams.set("query",query);
  Object.entries(params).forEach(([key,value])=>url.searchParams.set(`$${key}`,JSON.stringify(value)));
  const response=await fetch(url,{headers:{authorization:`Bearer ${sanityToken}`},cache:"no-store"});
  if(!response.ok)throw new Error(`Sanity query failed (${response.status})`);
  const payload=await response.json() as {result:T};
  return payload.result;
}

async function mail(to:string,subject:string,html:string,replyTo?:string){
  if(!resend)throw new Error("RESEND_API_KEY is missing");
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${resend}`},
    body:JSON.stringify({from:emailFrom,to:[to],subject,html,...(replyTo?{reply_to:replyTo}:{})}),
  });
  if(!response.ok){
    const details=await response.text();
    console.error("Resend email failed",response.status,details);
    throw new Error("Email failed");
  }
}

function escapeHtml(value:string){return value.replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]||character)}
function lineBreaks(value:string){return escapeHtml(value).replace(/\r?\n/g,"<br>")}
function isReviewAction(value:string):value is ReviewAction{return["published","rejected","hidden"].includes(value)}

async function moderationSignature(reviewId:string,action:ReviewAction,expires:string){
  if(!moderationSecret)throw new Error("Review moderation secret is missing");
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(moderationSecret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(`${reviewId}:${action}:${expires}`));
  return Array.from(new Uint8Array(signature),byte=>byte.toString(16).padStart(2,"0")).join("");
}

export async function createModerationLink(reviewId:string,action:ReviewAction,expires=String(Math.floor(Date.now()/1000)+moderationLifetime)){
  const signature=await moderationSignature(reviewId,action,expires);
  const params=new URLSearchParams({review:reviewId,action,expires,signature});
  return `${origin}/avis/moderer?${params}`;
}

export async function verifyModerationLink(reviewId:string,action:string,expires:string,signature:string){
  if(!reviewId||!isReviewAction(action)||!/^\d+$/.test(expires)||Number(expires)<Math.floor(Date.now()/1000)||!/^[a-f0-9]{64}$/i.test(signature))return false;
  const expected=await moderationSignature(reviewId,action,expires);
  return expected===signature.toLowerCase();
}

export async function createPendingReview(body:Record<string,string>){
  const id=`review-${crypto.randomUUID()}`;
  const review:ReviewRecord={_id:id,name:body.name.trim(),email:body.email.trim().toLowerCase(),service:body.service,rating:Number(body.rating||5),comment:body.comment.trim(),status:"pending"};
  await sanityMutate([{create:{...review,_type:"testimonial",submittedAt:new Date().toISOString()}}]);
  return review;
}

export async function sendReviewVerification(body:Record<string,string>){
  const link=`${origin}/api/avis/valider?token=${encodeURIComponent(body.token)}`;
  await mail(body.email.trim().toLowerCase(),"Validez votre avis Super-Service",`<h1>Merci pour votre avis</h1><p>Bonjour ${escapeHtml(body.name.trim())}, confirmez votre adresse e-mail pour transmettre votre avis à notre équipe.</p><p><a href="${link}" style="display:inline-block;padding:13px 20px;background:#e51d27;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Valider mon avis</a></p><p>L’avis sera relu avant publication.</p>`);
}

export async function sendReviewModerationRequest(review:ReviewRecord){
  const [publishLink,rejectLink,hideLink]=await Promise.all([
    createModerationLink(review._id,"published"),
    createModerationLink(review._id,"rejected"),
    createModerationLink(review._id,"hidden"),
  ]);
  const stars="★".repeat(Math.max(1,Math.min(5,review.rating||5)));
  await mail(emailTo,`Avis vérifié de ${review.name} – action requise`,`
    <h1>Un avis attend votre décision</h1>
    <p><strong>Client :</strong> ${escapeHtml(review.name)}<br><strong>Service :</strong> ${escapeHtml(review.service)}<br><strong>Note :</strong> ${stars}</p>
    <blockquote style="margin:20px 0;padding:16px;border-left:4px solid #063b86;background:#f4f7fb">${lineBreaks(review.comment)}</blockquote>
    <p>Choisissez une action. Une page de confirmation sécurisée s’ouvrira avant la mise à jour de Sanity.</p>
    <p>
      <a href="${publishLink}" style="display:inline-block;margin:4px;padding:12px 18px;background:#16834b;color:#fff;text-decoration:none;border-radius:7px;font-weight:700">Publier</a>
      <a href="${rejectLink}" style="display:inline-block;margin:4px;padding:12px 18px;background:#c62828;color:#fff;text-decoration:none;border-radius:7px;font-weight:700">Rejeter</a>
      <a href="${hideLink}" style="display:inline-block;margin:4px;padding:12px 18px;background:#5e6b7b;color:#fff;text-decoration:none;border-radius:7px;font-weight:700">Masquer</a>
    </p>
    <p><small>Ces liens sécurisés expirent dans 7 jours. L’avis reste aussi modifiable dans Sanity Studio.</small></p>`,review.email);
}

export async function validateReview(token:string){
  const review=await sanityQuery<ReviewRecord|null>(`*[_type=="testimonial" && verificationToken==$token][0]{_id,name,email,service,rating,comment,status}`,{token});
  if(!review?._id)return false;
  await sanityMutate([{patch:{id:review._id,set:{status:"verified",verifiedAt:new Date().toISOString()},unset:["verificationToken"]}}]);
  try{await sendReviewModerationRequest({...review,status:"verified"})}catch(error){console.error("Unable to send review moderation email",error)}
  return true;
}

export async function getReviewForModeration(reviewId:string){
  return sanityQuery<ReviewRecord|null>(`*[_type=="testimonial" && _id==$id][0]{_id,name,service,rating,comment,status}`,{id:reviewId});
}

export async function moderateReview(reviewId:string,action:ReviewAction){
  const now=new Date().toISOString();
  await sanityMutate([{patch:{id:reviewId,set:{status:action,moderatedAt:now,...(action==="published"?{publishedAt:now}:{})},...(action!=="published"?{unset:["publishedAt"]}:{})}}]);
}

export async function sendQuoteRequest(body:Record<string,string>){
  const name=escapeHtml(body.name.trim());
  const phone=escapeHtml(body.phone.trim());
  const address=escapeHtml(body.address.trim());
  const email=body.email.trim().toLowerCase();
  const service=escapeHtml(body.service.trim());
  const city=escapeHtml(body.city.trim());
  const date=escapeHtml(body.date?.trim()||"Date non précisée");
  const message=lineBreaks(body.message.trim());
  const internalMessage=`
    <h1>Nouvelle demande de devis</h1>
    <p><strong>Service :</strong> ${service}</p>
    <p><strong>Client :</strong> ${name}<br>
    <strong>Téléphone :</strong> ${phone}<br>
    <strong>E-mail :</strong> ${escapeHtml(email)}<br>
    <strong>Adresse :</strong> ${address}<br>
    <strong>Commune :</strong> ${city}<br>
    <strong>Date souhaitée :</strong> ${date}</p>
    <p><strong>Message :</strong><br>${message}</p>`;
  const customerMessage=`
    <h1>Nous avons bien reçu votre demande</h1>
    <p>Bonjour ${name},</p>
    <p>Merci d’avoir contacté Super-Service. Nous avons bien reçu votre demande concernant <strong>${service}</strong>.</p>
    <p>Notre équipe va l’étudier et vous répondra dans les meilleurs délais, généralement sous 24 heures.</p>
    <p>Pour compléter votre demande, vous pouvez répondre directement à cet e-mail ou nous contacter au <a href="tel:+41783223368">+41 78 322 33 68</a>.</p>
    <p>Cordialement,<br><strong>L’équipe Super-Service</strong><br>
    <a href="mailto:info@super-service.ch">info@super-service.ch</a></p>`;
  await mail(emailTo,`Nouvelle demande de devis – ${body.service.trim()}`,internalMessage,email);
  await mail(email,"Nous avons bien reçu votre demande de devis",customerMessage,emailTo);
}
