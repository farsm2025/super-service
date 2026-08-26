import {SITE_URL} from "./site";

const project=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID; const dataset=process.env.NEXT_PUBLIC_SANITY_DATASET||"production"; const token=process.env.SANITY_API_TOKEN; const resend=process.env.RESEND_API_KEY; const origin=process.env.SITE_URL||SITE_URL;
const emailFrom=process.env.EMAIL_FROM||"Super-Service <devis@mail.super-service.ch>";
const emailTo=process.env.EMAIL_TO||"info@super-service.ch";
async function sanityMutate(mutations:unknown[]){if(!project||!token)return;const r=await fetch(`https://${project}.api.sanity.io/v2026-03-01/data/mutate/${dataset}`,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${token}`},body:JSON.stringify({mutations})});if(!r.ok)throw new Error("Sanity mutation failed")}
async function mail(to:string,subject:string,html:string,replyTo?:string){
  if(!resend)throw new Error("RESEND_API_KEY is missing");
  const r=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"content-type":"application/json","authorization":`Bearer ${resend}`},
    body:JSON.stringify({from:emailFrom,to:[to],subject,html,...(replyTo?{reply_to:replyTo}:{})}),
  });
  if(!r.ok){
    const details=await r.text();
    console.error("Resend email failed",r.status,details);
    throw new Error("Email failed");
  }
}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]||character)}
function lineBreaks(value:string){return escapeHtml(value).replace(/\r?\n/g,"<br>")}
export async function createPendingReview(b:Record<string,string>){await sanityMutate([{create:{_type:"testimonial",name:b.name,email:b.email,service:b.service,rating:Number(b.rating||5),comment:b.comment,status:"pending",verificationToken:b.token,submittedAt:new Date().toISOString()}}])}
export async function sendReviewVerification(b:Record<string,string>){const link=`${origin}/api/avis/valider?token=${encodeURIComponent(b.token)}`;await mail(b.email,"Validez votre avis Super-Service",`<h1>Merci pour votre avis</h1><p>Bonjour ${b.name}, confirmez votre adresse e-mail pour transmettre votre avis à notre équipe.</p><p><a href="${link}">Valider mon avis</a></p><p>L’avis sera relu avant publication.</p>`)}
export async function validateReview(t:string){if(!project||!token)return false;const q=encodeURIComponent(`*[_type=="testimonial" && verificationToken==$token][0]{_id}`);const r=await fetch(`https://${project}.api.sanity.io/v2026-03-01/data/query/${dataset}?query=${q}&$token=${encodeURIComponent(JSON.stringify(t))}`,{headers:{authorization:`Bearer ${token}`}});const j=await r.json() as {result?:{_id?:string}};if(!j.result?._id)return false;await sanityMutate([{patch:{id:j.result._id,set:{status:"verified",verifiedAt:new Date().toISOString()},unset:["verificationToken"]}}]);await mail(emailTo,"Un avis attend votre approbation",`<p>Un nouvel avis vérifié est disponible dans Sanity Studio.</p>`);return true}
export async function sendQuoteRequest(b:Record<string,string>){
  const name=escapeHtml(b.name.trim());
  const phone=escapeHtml(b.phone.trim());
  const address=escapeHtml(b.address.trim());
  const email=b.email.trim().toLowerCase();
  const service=escapeHtml(b.service.trim());
  const city=escapeHtml(b.city.trim());
  const date=escapeHtml(b.date?.trim()||"Date non précisée");
  const message=lineBreaks(b.message.trim());
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
  await mail(emailTo,`Nouvelle demande de devis – ${b.service.trim()}`,internalMessage,email);
  await mail(email,"Nous avons bien reçu votre demande de devis",customerMessage,emailTo);
}
