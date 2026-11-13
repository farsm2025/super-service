import {redirect} from "next/navigation";
import Link from "next/link";
import {getAdminSession} from "@/lib/admin-auth";
import {CarnetClient} from "./carnet-client";
import "./carnet.css";
export const dynamic="force-dynamic";
export const metadata={title:"Carnet de devis | Super-Service",robots:{index:false,follow:false}};
export default async function CarnetPage(){
  if(!await getAdminSession())redirect("/gestion/connexion");
  return <div className="admin-app">
    <header className="admin-top"><div><span className="admin-brand">SUPER-SERVICE</span><p>Carnet de devis</p></div><div className="top-actions"><Link className="carnet-back" href="/gestion">← Calendrier</Link></div></header>
    <main className="admin-main"><CarnetClient/></main>
  </div>;
}
