import {redirect} from "next/navigation";
import Link from "next/link";
import {getAdminSession} from "@/lib/admin-auth";
import {HeuresClient} from "./heures-client";
import "./heures.css";
export const dynamic="force-dynamic";
export const metadata={title:"Heures du personnel | Super-Service",robots:{index:false,follow:false}};
export default async function HeuresPage(){
  if(!await getAdminSession())redirect("/gestion/connexion");
  return <div className="admin-app">
    <header className="admin-top"><div><span className="admin-brand">SUPER-SERVICE</span><p>Heures du personnel</p></div><div className="top-actions"><Link className="carnet-nav-link" href="/gestion">← Calendrier</Link><Link className="carnet-nav-link" href="/gestion/carnet">Carnet de devis</Link></div></header>
    <main className="admin-main"><HeuresClient/></main>
  </div>;
}
