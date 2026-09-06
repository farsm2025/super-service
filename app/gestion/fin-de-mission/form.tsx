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

  const fieldStyle={display:"block",width:"100%",marginTop:7,padding:"13px 14px",border:"1px solid #cbd4df",borderRadius:6,background:"#fff",color:"#101828"};

  return <main style={{minHeight:"100vh",background:"#f4f7fb",padding:"clamp(28px,7vw,80px) 20px"}}>
    <section style={{maxWidth:620,margin:"0 auto",background:"#fff",padding:"clamp(28px,5vw,46px)",borderRadius:12,boxShadow:"0 15px 45px #0a315319",borderTop:"4px solid var(--red)"}}>
      <p className="eyebrow">Super-Service</p>
      <h1 style={{fontSize:"clamp(32px,5vw,46px)",lineHeight:1.1,letterSpacing:"-.03em",margin:"0 0 16px",color:"var(--blue)"}}>Fin de mission</h1>
      <p style={{color:"var(--muted)",fontSize:16,margin:"0 0 28px"}}>Envoyez au client un message de remerciement avec un lien pour laisser un avis.</p>
      <form onSubmit={submit} style={{display:"grid",gap:19}}>
        <label style={{fontSize:14,fontWeight:800,color:"#34465a"}}>Nom du client
          <input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Nom et prénom" style={fieldStyle}/>
        </label>
        <label style={{fontSize:14,fontWeight:800,color:"#34465a"}}>Adresse e-mail
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="client@exemple.ch" style={fieldStyle}/>
        </label>
        <button className="button button-primary" type="submit" disabled={status==="sending"} style={{width:"100%",marginTop:5,cursor:status==="sending"?"wait":"pointer"}}>{status==="sending"?"Envoi en cours…":"Envoyer la demande d’avis"}</button>
      </form>
      {message?<p role="status" style={{marginTop:20,padding:"12px 14px",borderRadius:6,background:status==="success"?"#eefaf4":"#fff1f1",color:status==="success"?"#126b45":"#a3151c",fontWeight:700,fontSize:14}}>{message}</p>:null}
      <div style={{marginTop:30,paddingTop:22,borderTop:"1px solid var(--line)"}}><Link href="/" className="button button-outline" style={{width:"100%"}}>← Retour à l’accueil</Link></div>
    </section>
  </main>;
}
