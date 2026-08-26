import {PageShell} from "../ui/page-shell";
import {RequestForm} from "./request-form";
export default function AppointmentPage(){return <PageShell eyebrow="Rendez-vous Super-Service" title="Demandez une intervention" intro="Indiquez vos disponibilités. Votre demande sera examinée par notre équipe et ne sera confirmée qu’après notre validation."><main className="appointment-public"><RequestForm/></main></PageShell>}
