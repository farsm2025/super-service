"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {cartonCatalog,chf,type CartonQuantities} from "@/lib/carton-catalog";
type Order={id:string;quantities:CartonQuantities;amount:number;status:"pending"|"paid"|"expired"};
export function OrderStatus({token}:{token:string}){
  const [order,setOrder]=useState<Order|null>(null),[message,setMessage]=useState("Vérification du paiement…"),[busy,setBusy]=useState(false);
  async function refresh(){setBusy(true);try{const response=await fetch(`/api/commande/${encodeURIComponent(token)}`,{cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.error);setOrder(data);setMessage("Statut actualisé.");}catch(error){setMessage(error instanceof Error?error.message:"Statut indisponible.");}finally{setBusy(false);}}
  useEffect(()=>{let cancelled=false;fetch(`/api/commande/${encodeURIComponent(token)}`,{cache:"no-store"}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);if(!cancelled){setOrder(data);setMessage("Statut actualisé.");}}).catch(()=>{if(!cancelled)setMessage("Statut indisponible. Actualisez pour réessayer.");});return()=>{cancelled=true;};},[token]);
  return <><p><strong>Environnement de test — aucune commande réelle.</strong></p>{order && <><h2>{order.status==="paid"?"Paiement de test confirmé":order.status==="expired"?"Paiement expiré":"Paiement en attente"}</h2><ul>{cartonCatalog.filter(item=>order.quantities[item.id]>0).map(item=><li key={item.id}>{order.quantities[item.id]} × {item.name}</li>)}</ul><p>Total : <strong>{chf(order.amount)}</strong></p><p>Référence : {order.id}</p>{order.status==="pending" && <p>Une fermeture ou un retour depuis Stripe ne confirme pas le paiement.</p>}</>}<p role="status">{message}</p><div className="hero-actions"><button className="button" disabled={busy} onClick={refresh}>Actualiser le statut</button><Link className="button button-outline" href="/services/cartons-demenagement">Retour aux cartons</Link></div></>;
}
