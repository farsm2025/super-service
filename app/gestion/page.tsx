import {redirect} from "next/navigation";
import {getAdminSession} from "@/lib/admin-auth";
import {listAppointments} from "@/lib/appointments";
import {Dashboard} from "./dashboard";
export const dynamic="force-dynamic";
export default async function GestionPage({searchParams}:{searchParams:Promise<{demande?:string}>}){if(!await getAdminSession())redirect("/gestion/connexion");const appointments=await listAppointments();const {demande}=await searchParams;return <Dashboard initialAppointments={appointments} initialSelectedId={demande}/>}
