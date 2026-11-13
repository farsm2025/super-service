"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import type {ChangeEvent,FormEvent} from "react";
import type {QuoteNote,QuoteStatus} from "@/lib/quote-types";
import {quoteStatusLabels} from "@/lib/quote-types";

type FormState={firstName:string;lastName:string;phone:string;email:string;address:string;service:string;description:string;status:QuoteStatus;reminderAt:string};
const blank:FormState={firstName:"",lastName:"",phone:"",email:"",address:"",service:"",description:"",status:"a_traiter",reminderAt:""};
const services=["Déménagement","Nettoyage","Transport et livraison","Débarras","Montage de meubles","Petits travaux et jardinage","Location de camion","Autre"];
type ExistingAppointment={id:string;customerName:string;preferredDate:string};
function editForm(note:QuoteNote):FormState{
  return {firstName:note.firstName,lastName:note.lastName,phone:note.phone,email:note.email,address:note.address,
    service:note.service,description:note.description,status:note.status,
    reminderAt:note.reminderAt?new Date(note.reminderAt).toLocaleString("sv-SE").replace(" ","T").slice(0,16):""};
}
async function responseMessage(response:Response){
  const body=await response.json().catch(()=>({error:"Une erreur est survenue"}));
  if(!response.ok)throw new Error(body.error||"Une erreur est survenue");
  return body;
}
async function compressImage(file:File):Promise<File>{
  if(file.type!=="image/jpeg"&&file.type!=="image/png"&&file.type!=="image/webp")throw new Error("Utilisez une image JPG, PNG ou WebP.");
  // Re-encode locally to remove EXIF metadata and keep upload size below Vercel's limit.
  const bitmap=await createImageBitmap(file);
  try{
    const ratio=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
    const context=canvas.getContext("2d");
    if(!context)throw new Error("Impossible de préparer la photo");
    context.fillStyle="#ffffff";context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const output=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Compression impossible")),"image/jpeg",.68));
    if(output.size>450_000)throw new Error("Photo encore trop volumineuse après compression (450 Ko maximum).");
    return new File([output],(file.name.replace(/\.[^.]+$/,"")||"photo")+".jpg",{type:"image/jpeg"});
  }finally{bitmap.close()}
}
export function CarnetClient(){
  const [notes,setNotes]=useState<QuoteNote[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [form,setForm]=useState<FormState>(blank);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const [appointments,setAppointments]=useState<ExistingAppointment[]>([]);
  const [uploading,setUploading]=useState(false);
  const camera=useRef<HTMLInputElement>(null);
  const files=useRef<HTMLInputElement>(null);
  const selected=notes.find(n=>n.id===selectedId)||null;
  async function refresh(){
    try{
      const data=await responseMessage(await fetch("/api/gestion/carnet",{cache:"no-store"}));
      setNotes(data.notes||[]);
      setError("");
    }catch(e){setError(e instanceof Error?e.message:"Chargement impossible")}
    finally{setLoading(false)}
  }
  useEffect(()=>{void refresh();fetch("/api/gestion/rendez-vous",{cache:"no-store"})
    .then(r=>r.ok?r.json():{appointments:[]}).then(d=>setAppointments((d.appointments||[]).map((a:ExistingAppointment)=>({id:a.id,customerName:a.customerName,preferredDate:a.preferredDate}))))
    .catch(()=>{});},[]);
  const filtered=useMemo(()=>notes.filter(note=>{
    const text=[note.firstName,note.lastName,note.phone,note.address,note.service,note.description].join(" ").toLowerCase();
    return text.includes(search.trim().toLowerCase())&&(!filter||note.status===filter);
  }),[notes,search,filter]);
  function select(note:QuoteNote){setSelectedId(note.id);setForm(editForm(note));setError("");setMessage("")}
  function createNew(){setSelectedId(null);setForm(blank);setError("");setMessage("");window.scrollTo({top:0,behavior:"smooth"})}
  function setField<K extends keyof FormState>(key:K,value:FormState[K]){setForm(old=>({...old,[key]:value}))}
  async function save(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      const body={...form,reminderAt:form.reminderAt?new Date(form.reminderAt).toISOString():null};
      const url=selected?"/api/gestion/carnet/"+selected.id:"/api/gestion/carnet";
      const data=await responseMessage(await fetch(url,{method:selected?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}));
      await refresh();setSelectedId(data.note.id);setForm(editForm(data.note));setMessage("Fiche enregistrée.");
    }catch(e){setError(e instanceof Error?e.message:"Enregistrement impossible")}finally{setBusy(false)}
  }
  async function uploadFiles(e:ChangeEvent<HTMLInputElement>){
    if(!selected)return;
    const incoming=Array.from(e.target.files||[]);
    if(incoming.length>10){setError("Maximum 10 photos à la fois.");return}
    setUploading(true);setError("");setMessage("");
    let successes=0;
    try{
      for(const file of incoming){
        const converted=await compressImage(file);
        const formData=new FormData();formData.append("photo",converted);
        await responseMessage(await fetch("/api/gestion/carnet/"+selected.id+"/photos",{method:"POST",body:formData}));
        successes++;
      }
      await refresh();setMessage(successes+" photo(s) enregistrée(s).");
    }catch(err){await refresh();setError((err instanceof Error?err.message:"Photo non enregistrée")+" ("+successes+" enregistrée(s)).")}
    finally{setUploading(false);e.target.value=""}
  }
  async function caption(id:string,caption:string){
    try{
      await responseMessage(await fetch("/api/gestion/carnet/photos/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({caption})}));
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:"Légende non enregistrée")}
  }
  async function linkAppointment(id:string){
    if(!selected)return;
    setBusy(true);setError("");
    try{
      const data=await responseMessage(await fetch("/api/gestion/carnet/"+selected.id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action:"link_appointment",appointmentId:id||null})}));
      await refresh();setMessage(data.note?.appointmentId?"Rendez-vous associé.":"Rendez-vous dissocié.");
    }catch(e){setError(e instanceof Error?e.message:"Association impossible")}finally{setBusy(false)}
  }
  return <div className="carnet-layout">
    <div className="carnet-heading"><div><p className="admin-kicker">Gestion des demandes</p><h1>Carnet de devis</h1><p>Coordonnées, travaux, photos et suivi : tout dans une fiche.</p></div><button type="button" className="admin-primary" onClick={createNew}>+ Nouvelle note</button></div>
    {error&&<p className="carnet-alert" role="alert">{error}</p>}
    {message&&<p className="carnet-success" role="status">{message}</p>}
    <div className="carnet-columns">
      <aside className="carnet-sidebar">
        <label htmlFor="carnet-search">Rechercher une fiche</label>
        <input id="carnet-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, téléphone, travaux…"/>
        <select aria-label="Filtrer par statut" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(quoteStatusLabels).map(([id,name])=><option key={id} value={id}>{name}</option>)}
        </select>
        <div className="carnet-list">{loading?<p>Chargement…</p>:filtered.length===0?<p>Aucune demande trouvée.</p>:filtered.map(note=>
          <button type="button" key={note.id} className={"carnet-entry"+(note.id===selectedId?" selected":"")} onClick={()=>select(note)}>
            <strong>{[note.firstName,note.lastName].filter(Boolean).join(" ")}</strong>
            <small>{note.service||"Prestation à préciser"} · {note.phone}</small>
            <span>{quoteStatusLabels[note.status]}</span>
            <small>{note.photos.length} photo(s)</small>
          </button>)}</div>
      </aside>
      <section className="carnet-editor">
        <h2>{selected?"Modifier la fiche":"Nouvelle demande"}</h2>
        <form onSubmit={save}>
          <div className="carnet-two">
            <label>Prénom<input value={form.firstName} maxLength={100} onChange={e=>setField("firstName",e.target.value)} placeholder="Prénom"/></label>
            <label>Nom<input value={form.lastName} maxLength={100} onChange={e=>setField("lastName",e.target.value)} placeholder="Nom"/></label>
          </div>
          <div className="carnet-two">
            <label>Téléphone *<input type="tel" required maxLength={50} value={form.phone} onChange={e=>setField("phone",e.target.value)} placeholder="+41…"/></label>
            <label>E-mail (facultatif)<input type="email" maxLength={180} value={form.email} onChange={e=>setField("email",e.target.value)}/></label>
          </div>
          <label>Adresse des travaux<input maxLength={300} value={form.address} onChange={e=>setField("address",e.target.value)} placeholder="Rue, NPA, ville"/></label>
          <label>Type de prestation<select value={form.service} onChange={e=>setField("service",e.target.value)}>
            <option value="">Choisir…</option>{services.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
          <label>Description des travaux<textarea rows={7} maxLength={12000} value={form.description} onChange={e=>setField("description",e.target.value)} placeholder="Travaux à prévoir, mesures, accès, matériel nécessaire…"/></label>
          <div className="carnet-two">
            <label>Suivi<select value={form.status} onChange={e=>setField("status",e.target.value as QuoteStatus)}>{Object.entries(quoteStatusLabels).map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
            <label>Rappel (facultatif)<input type="datetime-local" value={form.reminderAt} onChange={e=>setField("reminderAt",e.target.value)}/></label>
          </div>
          <button type="submit" className="admin-primary" disabled={busy}>{busy?"Enregistrement…":selected?"Enregistrer les modifications":"Créer la fiche"}</button>
        </form>
        <div className="carnet-photo-section">
          <h3>Photos du chantier</h3>
          {!selected?<p>Enregistre d’abord la fiche, puis ajoute les photos.</p>:<>
            <div className="carnet-photo-actions">
              <button type="button" disabled={uploading} onClick={()=>camera.current?.click()}>📷 Prendre une photo</button>
              <button type="button" disabled={uploading} onClick={()=>files.current?.click()}>+ Ajouter des photos</button>
            </div>
            <input ref={camera} className="carnet-hidden" type="file" accept="image/*" capture="environment" onChange={uploadFiles}/>
            <input ref={files} className="carnet-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadFiles}/>
            {uploading&&<p role="status">Envoi des photos…</p>}
            <div className="carnet-photos">{selected.photos.map(photo=><div className="carnet-photo" key={photo.id}>
              <a href={"/api/gestion/carnet/photos/"+photo.id} target="_blank" rel="noreferrer" title="Agrandir la photo">
                {/* private URL through authenticated server-side proxy */}
                <img loading="lazy" alt={photo.caption||photo.filename||"Photo du chantier"} src={"/api/gestion/carnet/photos/"+photo.id}/>
              </a>
              <input aria-label={"Légende de "+photo.filename} maxLength={200} key={photo.id+photo.caption} defaultValue={photo.caption} placeholder="Ajouter une légende…" onBlur={e=>{if(e.target.value!==photo.caption)void caption(photo.id,e.target.value)}}/>
            </div>)}</div>
          </>}
        </div>
        {selected&&<div className="carnet-related">
          <h3>Rendez-vous associé (facultatif)</h3>
          <select aria-label="Associer un rendez-vous existant" value={selected.appointmentId||""} disabled={busy} onChange={e=>void linkAppointment(e.target.value)}>
            <option value="">Aucun rendez-vous associé</option>
            {appointments.map(a=><option key={a.id} value={a.id}>{a.customerName} · {a.preferredDate}</option>)}
          </select>
          <p><a href="/gestion">Ouvrir le calendrier pour fixer un nouveau rendez-vous</a></p>
        </div>}
      </section>
    </div>
  </div>;
}
