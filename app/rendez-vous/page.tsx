import {PageShell} from "../ui/page-shell";
import {RequestForm} from "./request-form";
import "./rendez-vous.css";
export default function AppointmentPage(){return <PageShell eyebrow="Rendez-vous Super-Service" title="Demandez une intervention" intro="Indiquez la date et l’heure souhaitées. Votre demande sera examinée par notre équipe et ne sera confirmée qu’après notre validation."><main className="appointment-public"><RequestForm/></main></PageShell>}
