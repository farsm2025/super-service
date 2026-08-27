import {absoluteUrl} from "./site";
import type {Appointment} from "./appointment-types";
import {createCustomerConfirmationToken} from "./appointment-confirmation";
import {zurichDateTimeToIso} from "./validation";

const resendKey=process.env.RESEND_API_KEY;
const emailFrom=process.env.EMAIL_FROM||"Super-Service <devis@mail.super-service.ch>";
const adminEmail=process.env.ADMIN_EMAIL||process.env.EMAIL_TO||"info@super-service.ch";

function escapeHtml(value:string){return value.replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]||character)}
function lines(value:string){return escapeHtml(value).replace(/\r?\n/g,"<br>")}
function formatDate(value:string|null){
  if(!value)return "À définir";
  return new Intl.DateTimeFormat("fr-CH",{dateStyle:"full",timeStyle:"short",timeZone:"Europe/Zurich"}).format(new Date(value));
}
function formatAvailability(date:string,time:string|null){
  if(!date||!time)return "Date à vérifier";
  try{return formatDate(zurichDateTimeToIso(`${date}T${time}`))}catch{return `${date} à ${time}`}
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
    <strong>Jour et heure proposés :</strong> ${escapeHtml(formatAvailability(appointment.preferredDate,appointment.preferredTimeStart))}<br>
    <strong>Motif :</strong><br>${lines(appointment.reason)}</p>
    <p><a href="${link}" style="display:inline-block;padding:13px 20px;background:#e51d27;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Ouvrir et traiter la demande</a></p>
  `,appointment.customerEmail,`appointment-new-${appointment.id}`);
}

export async function sendManualAppointmentConfirmationEmail(appointment:Appointment){
  await sendEmail(appointment.customerEmail,"Confirmation de votre rendez-vous",`
    <h1>Votre rendez-vous est confirmé</h1>
    <p><strong>Date et heure :</strong> ${formatDate(appointment.startsAt)}<br>
    <strong>Lieu :</strong> ${escapeHtml(appointment.customerAddress)}</p>
  `,adminEmail,`appointment-manual-confirmation-${appointment.id}`);
}

export async function sendAppointmentStatusEmail(appointment:Appointment,kind:"confirmed"|"modified"|"cancelled"|"rejected"){
  const titles={confirmed:"Votre rendez-vous est confirmé",modified:"Une nouvelle date vous est proposée",cancelled:"Votre rendez-vous est annulé",rejected:"Votre demande de rendez-vous"};
  const messages={
    confirmed:"Votre rendez-vous avec Super-Service est confirmé.",
    modified:"Super-Service vous propose une nouvelle date pour votre rendez-vous.",
    cancelled:"Votre rendez-vous avec Super-Service a été annulé.",
    rejected:"Super-Service ne peut malheureusement pas donner suite à votre demande pour le moment.",
  };
  const confirmationLink=kind==="modified"?absoluteUrl(`/rendez-vous/confirmer?token=${encodeURIComponent(createCustomerConfirmationToken(appointment))}`):null;
  await sendEmail(appointment.customerEmail,titles[kind],`
    <h1>${titles[kind]}</h1>
    <p>Bonjour ${escapeHtml(appointment.customerName)},</p>
    <p>${messages[kind]}</p>
    ${kind==="confirmed"||kind==="modified"?`<p><strong>Date et heure :</strong> ${formatDate(appointment.startsAt)}<br><strong>Adresse :</strong> ${escapeHtml(appointment.customerAddress)}<br><strong>Motif :</strong> ${lines(appointment.reason)}</p>`:""}
    ${confirmationLink?`<p><a href="${confirmationLink}" style="display:inline-block;padding:14px 22px;background:#188657;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Accepter cette nouvelle date</a></p><p><small>Le créneau est réservé provisoirement pendant 7 jours. Le rendez-vous sera confirmé après votre acceptation.</small></p>`:""}
    <p>Pour toute question, répondez à cet e-mail ou appelez le <a href="tel:+41783223368">+41 78 322 33 68</a>.</p>
    <p>Cordialement,<br><strong>L’équipe Super-Service</strong></p>
  `,adminEmail,`appointment-${kind}-${appointment.id}-${appointment.updatedAt}`);
}

export async function sendCustomerAcceptedEmail(appointment:Appointment){
  await sendEmail(adminEmail,`Nouvelle date acceptée – ${appointment.customerName}`,`
    <h1>Le client a accepté la nouvelle date</h1>
    <p><strong>${escapeHtml(appointment.customerName)}</strong> a confirmé le rendez-vous du <strong>${formatDate(appointment.startsAt)}</strong>.</p>
    <p>Le rendez-vous est maintenant confirmé dans le calendrier.</p>
    <p><a href="${absoluteUrl(`/gestion?demande=${appointment.id}`)}" style="display:inline-block;padding:13px 20px;background:#1768ac;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Ouvrir le rendez-vous</a></p>
  `,appointment.customerEmail,`appointment-customer-accepted-${appointment.id}-${appointment.updatedAt}`);
}

export async function sendMagicLinkEmail(token:string,origin?:string,appointmentId?:string){
  const destination=appointmentId?`&demande=${encodeURIComponent(appointmentId)}`:"";
  const link=absoluteUrl(`/api/gestion/auth/verify?token=${encodeURIComponent(token)}${destination}`,origin);
  await sendEmail(adminEmail,"Connexion à l’application Super-Service",`
    <h1>Ouvrez votre planning Super-Service</h1>
    <p>Vous avez demandé un lien de connexion à l’application de gestion des rendez-vous.</p>
    <p><a href="${link}" style="display:inline-block;padding:14px 22px;background:#e32632;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Ouvrir mon planning</a></p>
    <p><strong>Ce lien fonctionne pendant 15 minutes et une seule fois.</strong></p>
    <p>Après avoir appuyé sur le bouton, vous serez connecté automatiquement : aucun mot de passe n’est nécessaire.</p>
    <p>Si vous n’avez pas demandé cette connexion, vous pouvez ignorer cet e-mail.</p>
  `,undefined,`admin-login-${token.slice(0,16)}`);
}
