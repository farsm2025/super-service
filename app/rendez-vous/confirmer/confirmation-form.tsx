"use client";
import {useState} from "react";

export function ConfirmationForm({token}:{token:string}){
  const[state,setState]=useState<"idle"|"sending"|"confirmed"|"error">("idle");const[message,setMessage]=useState("");
  async function confirm(){setState("sending");setMessage("");try{const response=await fetch("/api/rendez-vous/confirmer",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})});const data=await response.json();if(response.ok)setState("confirmed");else{setState("error");setMessage(data.error||"Confirmation impossible.")}}catch{setState("error");setMessage("La connexion a échoué. Réessayez.")}}
  if(state==="confirmed")return <div className="customer-confirmation-success" role="status"><span>✓</span><h2>Votre rendez-vous est confirmé</h2><p>La date est maintenant enregistrée dans le calendrier de Super-Service.</p></div>;
  return <><button type="button" className="button button-primary customer-confirm-button" onClick={confirm} disabled={state==="sending"}>{state==="sending"?"Confirmation en cours…":"Accepter cette nouvelle date"}</button>{state==="error"&&<p className="form-error" role="alert">{message}</p>}</>;
}
