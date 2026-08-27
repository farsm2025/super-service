import Link from "next/link";
import {PageShell} from "../../ui/page-shell";
import {getPendingCustomerProposal} from "@/lib/appointment-confirmation";
import {ConfirmationForm} from "./confirmation-form";

export const dynamic="force-dynamic";
export const metadata={title:"Confirmer votre rendez-vous",robots:{index:false,follow:false}};

function formatDate(value:string){return new Intl.DateTimeFormat("fr-CH",{dateStyle:"full",timeStyle:"short",timeZone:"Europe/Zurich"}).format(new Date(value))}

export default async function ConfirmAppointmentPage({searchParams}:{searchParams:Promise<{token?:string}>}){
  const{token=""}=await searchParams;const pending=token?await getPendingCustomerProposal(token):null;
  return <PageShell eyebrow="Confirmation du rendez-vous" title={pending?"Une nouvelle date vous est proposée":"Ce lien n’est plus valable"} intro={pending?"Vérifiez les informations puis confirmez la nouvelle date proposée par Super-Service.":"La proposition a peut-être déjà été acceptée, modifiée ou le lien a expiré."}><main className="customer-confirmation-page">{pending?<section className="customer-confirmation-card"><p>Bonjour <strong>{pending.appointment.customerName}</strong>,</p><dl><dt>Date et heure</dt><dd>{formatDate(pending.appointment.startsAt||"")}</dd><dt>Adresse</dt><dd>{pending.appointment.customerAddress}</dd><dt>Motif</dt><dd>{pending.appointment.reason}</dd></dl><p>Ce créneau est actuellement réservé provisoirement. Il deviendra définitif après votre confirmation.</p><ConfirmationForm token={token}/></section>:<section className="customer-confirmation-card invalid"><p>Vous pouvez contacter Super-Service pour vérifier votre rendez-vous.</p><a className="button button-primary" href="tel:+41783223368">Appeler Super-Service</a><Link className="button button-outline" href="/">Retour au site</Link></section>}</main></PageShell>;
}
