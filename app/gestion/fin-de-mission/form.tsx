"use client";

import {FormEvent,useState} from "react";
import Link from "next/link";

export function FinDeMissionForm(){
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const[message,setMessage]=useState("");

  async function submit(event:FormEvent){
    event.preventDefault();
    setStatus("sending");setMessage("");
    try{
      const response=await fetch("/api/gestion/fin-de-mission",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,email})});
      const data=await response.json() as {message?:string};
      if(!response.ok)throw new Error(data.message||"Envoi impossible");
      setStatus("success");setMessage(`L’e-mail a bien été envoyé à ${email}.`);setName("");setEmail("");
    }catch(error){setStatus("error");setMessage(error instanceof Error?error.message:"L’envoi a échoué.")}
  }

  return <main className="gestion-shell"><section className="gestion-panel" style={{maxWidth:620,margin:"40px auto"}}><p className="eyebrow">Super-Service</p><h1>Fin de mission</h1><p>Envoyez au client un message de remerciement avec un lien pour laisser un avis.</p><form onSubmit={submit} style={{display:"grid",gap:16,marginTop:24}}><label>Nom du client<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" style={{display:"block",width:"100%",marginTop:6,padding:12}}/></label><label>Adresse e-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" style={{display:"block",width:"100%",marginTop:6,padding:12}}/></label><button className="primary-button" type="submit" disabled={status==="sending"}>{status==="sending"?"Envoi en cours…":"Envoyer la demande d’avis"}</button></form>{message?<p role="status" style={{marginTop:18,fontWeight:700}}>{message}</p>:null}<p style={{marginTop:28}}><Link href="/gestion">← Retour à la gestion</Link></p></section></main>;
}
