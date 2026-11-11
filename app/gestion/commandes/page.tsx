import {notFound,redirect} from "next/navigation";
import Link from "next/link";
import {getAdminSession} from "@/lib/admin-auth";
import {stripeTestEnabled} from "@/lib/stripe-config";
import {listCartonOrders} from "@/lib/carton-orders";
import {cartonCatalog,chf} from "@/lib/carton-catalog";
export const dynamic="force-dynamic";
const labels={pending:"En attente",paid:"Payée — Test",expired:"Expirée"};
export default async function OrdersPage(){
  if(!stripeTestEnabled())notFound();if(!await getAdminSession())redirect("/gestion/connexion");
  const orders=await listCartonOrders();
  return <main style={{padding:"32px",maxWidth:"1000px",margin:"0 auto"}}><Link href="/gestion">← Rendez-vous</Link><h1>Commandes de cartons — Test</h1><p>Aucune commande réelle. Les statuts sont enregistrés après vérification auprès de Stripe.</p><p><Link href="/gestion/commandes">Actualiser les commandes</Link></p>{!orders.length?<p>Aucune commande.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left",borderSpacing:"12px"}}><thead><tr><th>Date</th><th>Commande</th><th>Montant</th><th>Statut</th><th>E-mail</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td>{new Date(order.created_at).toLocaleString("fr-CH",{timeZone:"Europe/Zurich"})}</td><td>{cartonCatalog.filter(item=>order.quantities[item.id]>0).map(item=><div key={item.id}>{order.quantities[item.id]} × {item.name}</div>)}<small>{order.id}</small></td><td>{chf(order.amount)}</td><td>{labels[order.status]}</td><td>{order.customer_email||"—"}</td></tr>)}</tbody></table></div>}</main>;
}
