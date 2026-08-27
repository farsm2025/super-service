import {redirect} from "next/navigation";
import {getAdminSession} from "@/lib/admin-auth";
import {listAppointments} from "@/lib/appointments";
import {Dashboard} from "./dashboard";
export const dynamic="force-dynamic";
export default async function GestionPage({searchParams}:{searchParams:Promise<{demande?:string}>}){const{demande}=await searchParams;const appointmentId=/^[0-9a-f-]{36}$/i.test(demande||"")?demande:undefined;if(!await getAdminSession())redirect(`/gestion/connexion${appointmentId?`?demande=${appointmentId}`:""}`);const appointments=await listAppointments();return <Dashboard initialAppointments={appointments} initialSelectedId={appointmentId}/>}
