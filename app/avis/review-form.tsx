"use client";

import {useState} from "react";

export function ReviewForm(){
  const[status,setStatus]=useState("");
  const[submitting,setSubmitting]=useState(false);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submitting)return;
    setSubmitting(true);
    setStatus("Envoi en cours…");
    const form=new FormData(event.currentTarget);
    try{
      const response=await fetch("/api/avis",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(form))});
      if(!response.ok)throw new Error("Review submission failed");
      event.currentTarget.reset();
      window.location.assign("/?avis=envoye#avis");
    }catch{
      setStatus("L’envoi n’a pas abouti. Vous pouvez réessayer ou nous contacter.");
      setSubmitting(false);
    }
  }

  return <aside className="review-form" id="donner-avis"><p className="eyebrow">Votre expérience compte</p><h2>Donnez votre avis</h2><p>Votre avis ne sera publié qu’après validation de votre adresse e-mail et approbation par Super-Service.</p><form onSubmit={submit}><label>Nom et prénom<input required name="name" autoComplete="name"/></label><label>Adresse e-mail<input required type="email" name="email" autoComplete="email"/></label><label>Service<select required name="service" defaultValue=""><option value="" disabled>Choisir</option><option>Déménagement</option><option>Nettoyage</option><option>Location de camion</option><option>Transport et livraison</option><option>Montage de meubles</option><option>Débarras</option><option>Petits travaux et jardinage</option></select></label><label>Note<select required name="rating" defaultValue="5"><option value="5">5 étoiles</option><option value="4">4 étoiles</option><option value="3">3 étoiles</option><option value="2">2 étoiles</option><option value="1">1 étoile</option></select></label><label>Votre commentaire<textarea required minLength={20} name="comment" rows={6}/></label><label className="consent"><input required type="checkbox" name="consent" value="yes"/> J’accepte que mon avis soit publié après validation.</label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/><button className="button button-primary" type="submit" disabled={submitting}>{submitting?"Envoi en cours…":"Envoyer mon avis"}</button><p className="form-status" aria-live="polite">{status}</p></form></aside>;
}
