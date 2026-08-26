import {absoluteUrl} from "./site";
import type {Appointment} from "./appointment-types";

const resendKey=process.env.RESEND_API_KEY;
const emailFrom=process.env.EMAIL_FROM||"Super-Service <devis@mail.super-service.ch>";
const adminEmail=process.env.ADMIN_EMAIL||process.env.EMAIL_TO||"info@super-service.ch";

function escapeHtml(value:string){return value.replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]||character)}
function lines(value:string){return escapeHtml(value).replace(/\r?\n/g,"<br>")}
function formatDate(value:string|null){
  if(!value)return "À définir";
  return new Intl.DateTimeFormat("fr-CH",{dateStyle:"full",timeStyle:"short",timeZone:"Europe/Zurich"}).format(new Date(value));
}

async function sendEmail(to:string,subject:string,html:string,replyTo?:string,idempotencyKey?:string){
  if(!resendKey)throw new Error("RESEND_API_KEY is missing");
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${resendKey}`,...(idempotencyKey?{"Idempotency-Key":idempotencyKey}:{})},
    body:JSON.stringify({from:emailFrom,to:[to],subject,html,...(replyTo?{reply_to:replyTo}:{})}),
  });
  if(!response.ok)throw new Error(`Email failed (${response.status})`);
}

export async function sendNewRequestEmail(appointment:Appointment){
  const link=absoluteUrl(`/gestion?demande=${appointment.id}`);
  await sendEmail(adminEmail,`Nouvelle demande – ${appointment.customerName}`,`
    <h1>Nouvelle demande de rendez-vous</h1>
    <p><strong>Client :</strong> ${escapeHtml(appointment.customerName)}<br>
    <strong>Téléphone :</strong> ${escapeHtml(appointment.customerPhone)}<br>
    <strong>E-mail :</strong> ${escapeHtml(appointment.customerEmail)}<br>
    <strong>Adresse :</strong> ${escapeHtml(appointment.customerAddress)}</p>
    <p><strong>Type :</strong> ${escapeHtml(appointment.requestType)}<br>
    <strong>Date souhaitée :</strong> ${escapeHtml(appointment.preferredDate)} ${escapeHtml(appointment.preferredTimeStart||"")}<br>
    <strong>Motif :</strong><br>${lines(appointment.reason)}</p>
    <p><a href="${link}" style="display:inline-block;padding:13px 20px;background:#e51d27;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Ouvrir et traiter la demande</a></p>
  `,appointment.customerEmail,`appointment-new-${appointment.id}`);
}

export async function sendAppointmentStatusEmail(appointment:Appointment,kind:"confirmed"|"modified"|"cancelled"|"rejected"){
  const titles={confirmed:"Votre rendez-vous est confirmé",modified:"Une nouvelle date vous est proposée",cancelled:"Votre rendez-vous est annulé",rejected:"Votre demande de rendez-vous"};
  const messages={
    confirmed:"Votre rendez-vous avec Super-Service est confirmé.",
    modified:"Super-Service vous propose une nouvelle date pour votre rendez-vous.",
    cancelled:"Votre rendez-vous avec Super-Service a été annulé.",
    rejected:"Super-Service ne peut malheureusement pas donner suite à votre demande pour le moment.",
  };
  await sendEmail(appointment.customerEmail,titles[kind],`
    <h1>${titles[kind]}</h1>
    <p>Bonjour ${escapeHtml(appointment.customerName)},</p>
    <p>${messages[kind]}</p>
    ${kind==="confirmed"||kind==="modified"?`<p><strong>Date et heure :</strong> ${formatDate(appointment.startsAt)}<br><strong>Adresse :</strong> ${escapeHtml(appointment.customerAddress)}<br><strong>Motif :</strong> ${lines(appointment.reason)}</p>`:""}
    <p>Pour toute question, répondez à cet e-mail ou appelez le <a href="tel:+41783223368">+41 78 322 33 68</a>.</p>
    <p>Cordialement,<br><strong>L’équipe Super-Service</strong></p>
  `,adminEmail,`appointment-${kind}-${appointment.id}-${appointment.updatedAt}`);
}

export async function sendMagicLinkEmail(token:string){
  const link=absoluteUrl(`/api/gestion/auth/verify?token=${encodeURIComponent(token)}`);
  await sendEmail(adminEmail,"Connexion à l’application Super-Service",`
    <h1>Connexion à votre planning</h1>
    <p>Utilisez ce lien sécurisé pour ouvrir l’application de gestion des rendez-vous.</p>
    <p><a href="${link}" style="display:inline-block;padding:13px 20px;background:#063b86;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Ouvrir mon planning</a></p>
    <p>Ce lien expire dans 15 minutes. Ignorez cet e-mail si vous n’avez pas demandé de connexion.</p>
  `,undefined,`admin-login-${token.slice(0,16)}`);
}
