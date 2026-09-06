import {redirect} from "next/navigation";
import {getAdminSession} from "@/lib/admin-auth";
import {FinDeMissionForm} from "./form";

export const dynamic="force-dynamic";

export default async function FinDeMissionPage(){
  if(!await getAdminSession())redirect("/gestion/connexion");
  return <FinDeMissionForm/>;
}
