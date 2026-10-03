"use client";
import {useEffect,useMemo,useState} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements,PaymentElement,useElements,useStripe} from "@stripe/react-stripe-js";
export function DepositForm({token,publishableKey}:{token:string;publishableKey:string}) {
  const stripe=useMemo(()=>loadStripe(publishableKey),[publishableKey]);
  const [secret,setSecret]=useState<string|null>(null);const [status,setStatus]=useState("Chargement…");const [busy,setBusy]=useState(false);
  const endpoint=`/api/paiement/caution/${encodeURIComponent(token)}`;
  const labels:Record<string,string>={authorized:"Caution autorisée : 100 CHF réservés, sans encaissement.",captured:"Caution encaissée.",released:"Caution libérée. Le délai d’affichage dépend de votre banque.",expired:"L’autorisation a expiré. Contactez Super Service.",pending:"Prêt à autoriser la caution."};
  async function refresh() {const res=await fetch(endpoint,{cache:"no-store"});const data=await res.json();if(!res.ok)throw new Error(data.error);setStatus(data.deposit.linkExpired&&data.deposit.status==="pending"?"Ce lien a expiré. Contactez Super Service.":labels[data.deposit.status]||"Autorisation en cours.");if(data.deposit.status!=="pending")setSecret(null);}
  useEffect(()=>{let active=true;fetch(endpoint,{cache:"no-store"}).then(async res=>{const data=await res.json();if(active)setStatus(res.ok?(labels[data.deposit.status]||"Autorisation en cours."):data.error);}).catch(()=>{if(active)setStatus("Connexion impossible. Réessayez.");});return()=>{active=false;};},[endpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  async function start(){setBusy(true);try{const res=await fetch(endpoint,{method:"POST"});const data=await res.json();if(!res.ok)throw new Error(data.error);setSecret(data.clientSecret);setStatus(labels[data.deposit.status]||"Autorisation en cours.");}catch(error){setStatus(error instanceof Error?error.message:"Erreur de connexion");}finally{setBusy(false);}}
  return <div><p role="status">{status}</p>{secret?<Elements stripe={stripe} options={{clientSecret:secret,locale:"fr"}}><CardForm onConfirmed={refresh}/></Elements>:<button disabled={busy} onClick={start}>{busy?"Chargement…":"Ouvrir le formulaire sécurisé"}</button>}<p><button onClick={()=>refresh().catch(()=>setStatus("Actualisation impossible."))}>Actualiser le statut</button></p></div>;
}
function CardForm({onConfirmed}:{onConfirmed:()=>Promise<void>}) {
  const stripe=useStripe();const elements=useElements();const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function submit(event:React.FormEvent){event.preventDefault();if(!stripe||!elements||busy)return;setBusy(true);setError("");try{const result=await stripe.confirmPayment({elements,confirmParams:{return_url:window.location.origin+window.location.pathname},redirect:"if_required"});if(result.error)setError(result.error.message||"Autorisation impossible.");else await onConfirmed();}catch{setError("Statut à vérifier : actualisez avant de réessayer.");}finally{setBusy(false);}}
  return <form onSubmit={submit}><PaymentElement/>{error&&<p role="alert">{error}</p>}<button disabled={!stripe||busy} style={{marginTop:20}}>{busy?"Autorisation…":"Autoriser la caution de 100 CHF (test)"}</button></form>;
}
