"use client";
import {useEffect,useMemo,useState} from "react";
type Person={id:string;firstName:string;lastName:string;email:string;archivedAt:string|null};
type Line={id:string;date:string;description:string;hours:number;amountCents:number;personId?:string};
type Report={id:string;personId:string;cutoffDate:string;createdAt:string;version:number;lines:Line[];deletedAt:string|null;emailStatus:"pending"|"sending"|"sent"|"failed"|"skipped";emailTo:string;emailedAt:string|null;emailError:string|null};
type State={people:Person[];entries:Line[];reports:Report[]};
const empty={people:[],entries:[],reports:[]} as State;
const currentDate=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Zurich"});
const francs=(cents:number)=>new Intl.NumberFormat("fr-CH",{style:"currency",currency:"CHF"}).format(cents/100);
const decimal=(n:number)=>new Intl.NumberFormat("fr-CH",{maximumFractionDigits:2}).format(n);
const dateDisplay=(d:string)=>d.split("-").reverse().join(".");
const services=["Déménagement","Nettoyage","Transport et livraison","Débarras","Montage de meubles","Petits travaux et jardinage","Location de camions","Cartons de déménagement","Autre"] as const;
const blank=()=>({date:currentDate(),description:"",hours:"",amount:""});
const splitService=(description:string)=>{
  for(const service of services){if(description===service)return {service,details:""};
    if(description.startsWith(service+" — "))return {service,details:description.slice(service.length+3)};
  }
  return {service:"Autre",details:description==="Autre"?"":description};
};
type Editor=ReturnType<typeof blank>;
const normalize=(line:Line):Editor=>({date:line.date,description:line.description,hours:String(line.hours),amount:String(line.amountCents/100)});
const total=(lines:Line[])=>({hours:lines.reduce((n,l)=>n+Number(l.hours),0),amount:lines.reduce((n,l)=>n+Number(l.amountCents),0)});
async function request(body?:Record<string,unknown>):Promise<Record<string,unknown>>{
  const response=await fetch("/api/gestion/heures",{method:body?"POST":"GET",headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"});
  const result=await response.json().catch(()=>({error:"Réponse indisponible"}));
  if(!response.ok)throw Error(result.error||"Erreur de serveur");
  return result;
}
export function HeuresClient(){
  const [data,setData]=useState<State>(empty);
  const [personId,setPersonId]=useState("");
  const [name,setName]=useState({firstName:"",lastName:"",email:""});
  const [emailEdit,setEmailEdit]=useState("");
  const [service,setService]=useState<string>("");
  const [details,setDetails]=useState("");
  const [form,setForm]=useState<Editor>(blank);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [cutoff,setCutoff]=useState(currentDate);
  const [selectedReport,setSelectedReport]=useState("");
  const [corrections,setCorrections]=useState<Line[]|null>(null);
  const [working,setWorking]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  async function reload(){
    const state=await request() as unknown as State;
    setData(state);setPersonId(id=>state.people.some(p=>p.id===id)?id:(state.people[0]?.id||""));
    return state;
  }
  useEffect(()=>{let active=true;request().then(r=>{if(!active)return;const s=r as unknown as State;setData(s);setPersonId(s.people[0]?.id||"");}).catch(e=>{if(active)setError(String(e.message))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  async function run(action:Record<string,unknown>,success:string){
    setWorking(true);setError("");setNotice("");
    try{await request(action);await reload();setNotice(success);return true}
    catch(e){setError(e instanceof Error?e.message:"Erreur de traitement");return false}
    finally{setWorking(false)}
  }
  const person=data.people.find(p=>p.id===personId);
  const personArchived=Boolean(person?.archivedAt);
  useEffect(()=>{setEmailEdit(person?.email||"")},[personId,person?.email]);
  const pending=data.entries.filter(e=>e.personId===personId).sort((a,b)=>a.date.localeCompare(b.date));
  const sums=total(pending);
  const reports=data.reports.filter(r=>r.personId===personId);
  const activeReports=reports.filter(r=>!r.deletedAt);
  const trashReports=reports.filter(r=>Boolean(r.deletedAt));
  const hasHistory=reports.length>0||data.entries.some(e=>e.personId===personId);
  const latestVersion=(id:string)=>Math.max(0,...reports.filter(r=>r.id===id).map(r=>Number(r.version)));
  const report=reports.find(r=>r.id+":"+r.version===selectedReport)||null;
  const reportLines=corrections??report?.lines??[];
  const reportTotal=total(reportLines);
  function chooseReport(value:string){setSelectedReport(value);setCorrections(null)}
  function change<K extends keyof Editor>(key:K,value:Editor[K]){setForm(f=>({...f,[key]:value}))}
  async function addPerson(event:React.FormEvent){
    event.preventDefault();const ok=await run({action:"person",...name},"Personne enregistrée.");
    if(ok){setName({firstName:"",lastName:"",email:""});}
  }
  async function saveEmail(event:React.FormEvent){
    event.preventDefault();if(!person)return;
    await run({action:"update_person_email",personId:person.id,email:emailEdit},"Adresse e-mail de la personne mise à jour.");
  }
  async function resend(){
    if(!report||working)return;
    setWorking(true);setError("");setNotice("");
    try{const result=await request({action:"resend_report",reportId:report.id});await reload();setNotice(String(result.message||"Demande de renvoi traitée."))}
    catch(e){setError(e instanceof Error?e.message:"Renvoi impossible")}
    finally{setWorking(false)}
  }
  async function personAction(action:"archive_person"|"restore_person"|"delete_person"){
    if(!person)return;
    const confirmation=action==="archive_person"
      ?"Archiver "+person.firstName+" "+person.lastName+" ? Ses heures et anciens décomptes seront conservés."
      :action==="restore_person"
        ?"Réactiver cette personne et la rendre disponible pour les nouvelles interventions ?"
        :"Supprimer définitivement cette fiche sans heures ni décomptes ?";
    if(!window.confirm(confirmation))return;
    const ok=await run({action,personId:person.id},action==="archive_person"?"Personne archivée, historique conservé.":action==="restore_person"?"Personne réactivée.":"Fiche supprimée.");
    if(ok){setEditingId(null);setForm(blank());setSelectedReport("");setCorrections(null)}
  }
  async function deletePersonPermanently(){
    if(!person||working)return;
    const fullName=[person.firstName,person.lastName].join(" ").trim();
    const countPending=data.entries.filter(e=>e.personId===person.id).length;
    const countReports=new Set(data.reports.filter(r=>r.personId===person.id).map(r=>r.id)).size;
    if(!window.confirm("SUPPRESSION DÉFINITIVE de "+fullName+" ?\n\n"+countPending+" intervention(s) en cours et "+countReports+" décompte(s), avec toutes leurs versions, seront effacés.\n\nCette action est irréversible. Continuer ?"))return;
    const typed=window.prompt("Deuxième confirmation : saisissez exactement le prénom et le nom de la personne à supprimer :\n"+fullName);
    if(typed!==fullName){if(typed!==null)setError("Suppression annulée : le nom saisi ne correspond pas.");return}
    const ok=await run({action:"permanent_delete_person",personId:person.id,confirmName:typed,confirmation:"SUPPRIMER DÉFINITIVEMENT"},"La personne et toutes ses données de suivi des heures ont été définitivement supprimées.");
    if(ok){setEditingId(null);setForm(blank());setSelectedReport("");setCorrections(null)}
  }
  async function deleteReportPermanently(){
    if(!report||working)return;
    if(!window.confirm("SUPPRESSION DÉFINITIVE du décompte du "+dateDisplay(report.cutoffDate)+" ?\nToutes ses versions et les heures enregistrées dans ce décompte seront supprimées. La personne sera conservée. Cette action est irréversible."))return;
    const typed=window.prompt("Deuxième confirmation : écrivez SUPPRIMER pour effacer définitivement ce décompte.");
    if(typed!=="SUPPRIMER"){if(typed!==null)setError("Suppression annulée : confirmation incorrecte.");return}
    const ok=await run({action:"permanent_delete_report",reportId:report.id,personId:report.personId,confirmation:"SUPPRIMER DÉFINITIVEMENT"},"Décompte et versions définitivement supprimés.");
    if(ok){setSelectedReport("");setCorrections(null)}
  }
  async function reportAction(action:"trash_report"|"restore_report"){
    if(!report)return;
    const confirming=action==="trash_report"?"Mettre ce décompte et toutes ses versions dans la corbeille ? Les données pourront être restaurées.":"Restaurer ce décompte et toutes ses versions dans l'historique ?";
    if(!window.confirm(confirming))return;
    const ok=await run({action,reportId:report.id},action==="trash_report"?"Décompte déplacé dans la corbeille.":"Décompte restauré dans l'historique.");
    if(ok){setSelectedReport("");setCorrections(null)}
  }
  async function saveEntry(event:React.FormEvent){
    event.preventDefault();if(!personId)return;
    const description=(service==="Autre"?details.trim()||"Autre":service+(details.trim()?" — "+details.trim():""));
    if(!service){setError("Sélectionnez une prestation.");return}
    const ok=await run({action:"entry",personId,...form,description,...(editingId?{id:editingId}:{})},editingId?"Intervention modifiée.":"Intervention ajoutée.");
    if(ok){setEditingId(null);setForm(blank());setService("");setDetails("")}
  }
  function startEdit(line:Line){const parts=splitService(line.description);setService(parts.service);setDetails(parts.details);setEditingId(line.id);setForm(normalize(line));window.scrollTo({top:0,behavior:"smooth"})}
  async function remove(id:string){
    if(!window.confirm("Supprimer cette intervention non clôturée ?"))return;
    await run({action:"delete",id,personId},"Intervention supprimée.");
  }
  async function close(){
    const toClose=pending.filter(e=>e.date<=cutoff);
    if(!toClose.length){setError("Aucune intervention à clôturer pour cette date.");return}
    if(!window.confirm("Clôturer "+decimal(total(toClose).hours)+" heures et "+francs(total(toClose).amount)+" jusqu'au "+dateDisplay(cutoff)+" ? Les lignes seront archivées."))return;
    setWorking(true);setError("");setNotice("");
    try{
      const result=await request({action:"close",personId,cutoffDate:cutoff});
      const fresh=await reload();
      const chosen=fresh.reports.find(r=>r.id===result.id);
      if(chosen)setSelectedReport(chosen.id+":"+chosen.version);
      setCorrections(null);
      setNotice(String(result.message||"Décompte clôturé et conservé dans l’historique."));
    }catch(e){setError(e instanceof Error?e.message:"Clôture impossible")}
    finally{setWorking(false)}
  }
  function startRevision(){
    if(!report||report.deletedAt)return;
    if(Number(report.version)!==latestVersion(report.id)){setError("Sélectionnez la dernière version du décompte avant de le corriger.");return}
    if(!window.confirm("Créer une version corrigée de ce décompte ? Les anciennes versions resteront dans l'historique."))return;
    setCorrections(report.lines.map(x=>({...x})));
  }
  function editArchived(index:number,key:"date"|"description"|"hours"|"amountCents",value:string){
    setCorrections(lines=>lines?.map((l,i)=>i===index?{...l,[key]:key==="hours"?Number(value):key==="amountCents"?Math.round(Number(value)*100):value}:l)||null);
  }
  function addCorrection(){
    setCorrections(lines=>lines?[...lines,{id:crypto.randomUUID(),date:currentDate(),description:"",hours:1,amountCents:0}]:lines);
  }
  function removeCorrection(id:string){
    if(!window.confirm("Enlever cette ligne du décompte corrigé ? La version précédente la conservera."))return;
    setCorrections(lines=>lines?.filter(l=>l.id!==id)||null);
  }
  async function saveRevision(){
    if(!report||!corrections||report.deletedAt)return;
    const ok=await run({action:"revise",reportId:report.id,expectedVersion:latestVersion(report.id),lines:corrections.map(l=>({id:l.id,date:l.date,description:l.description,hours:l.hours,amount:l.amountCents/100}))},"Nouvelle version enregistrée. La précédente reste disponible.");
    if(ok){const refreshed=await request() as unknown as State;const newest=refreshed.reports.find(r=>r.id===report.id);if(newest)setSelectedReport(newest.id+":"+newest.version);setCorrections(null)}
  }
  const visibleName=person?[person.firstName,person.lastName].join(" "):"";
  return <div className="hours-page">
    <section className="hours-heading no-print"><div><p className="admin-kicker">Gestion du personnel</p><h1>Décompte des heures</h1><p>Saisissez les prestations et leurs montants, puis clôturez les périodes pour conserver un historique.</p></div></section>
    {error&&<p role="alert" className="hours-error no-print">{error}</p>}
    {notice&&<p role="status" className="hours-notice no-print">{notice}</p>}
    {loading?<p>Chargement…</p>:<div className="hours-layout no-print">
      <aside className="hours-card"><h2>Personnes</h2>
        <label className="hours-label">Sélectionner une personne
          <select value={personId} onChange={e=>{setPersonId(e.target.value);setEditingId(null);setForm(blank());setSelectedReport("");setCorrections(null)}}>
            {data.people.length===0&&<option value="">Ajoutez une personne</option>}
            {data.people.map(p=><option value={p.id} key={p.id}>{p.firstName} {p.lastName}{p.archivedAt?" (archivée)":""}</option>)}
          </select>
        </label>
        {person&&<form className="hours-email-form" onSubmit={saveEmail}>
          <label className="hours-label">Adresse e-mail de la personne
            <input type="email" maxLength={254} placeholder="prenom.nom@exemple.ch" value={emailEdit} onChange={e=>setEmailEdit(e.target.value)}/>
          </label>
          <button type="submit" className="hours-secondary" disabled={working||emailEdit===(person.email||"")}>Enregistrer l'e-mail</button>
        </form>}
        {person&&<div className="hours-person-actions">
          {personArchived?<button type="button" className="hours-secondary" disabled={working} onClick={()=>personAction("restore_person")}>Réactiver la personne</button>:<button type="button" className="hours-secondary" disabled={working} onClick={()=>personAction("archive_person")}>Archiver la personne</button>}
          <button type="button" className="hours-secondary hours-destructive" disabled={working} onClick={deletePersonPermanently}>Supprimer définitivement la personne</button>
          {hasHistory&&<small>Attention : cette suppression effacera aussi toutes ses interventions et tous ses décomptes, même ceux archivés.</small>}
        </div>}
        <form onSubmit={addPerson} className="hours-person-form"><h3>Ajouter une personne</h3>
          <label className="hours-label">Prénom<input required maxLength={100} value={name.firstName} onChange={e=>setName(n=>({...n,firstName:e.target.value}))}/></label>
          <label className="hours-label">Nom<input required maxLength={100} value={name.lastName} onChange={e=>setName(n=>({...n,lastName:e.target.value}))}/></label>
          <label className="hours-label">E-mail (facultatif)<input type="email" maxLength={254} value={name.email} onChange={e=>setName(n=>({...n,email:e.target.value}))}/></label>
          <button className="hours-secondary" disabled={working}>+ Ajouter la personne</button>
        </form>
      </aside>
      <div className="hours-content">
        {person?<><section className="hours-card"><div className="hours-title"><div><p className="admin-kicker">Interventions non clôturées</p><h2>{visibleName}</h2></div><div className="hours-totals"><span>{decimal(sums.hours)} h</span><strong>{francs(sums.amount)}</strong></div></div>
          {personArchived&&<p className="hours-empty">Cette personne est archivée. Réactivez-la pour saisir ou clôturer de nouvelles heures.</p>}
          {!personArchived&&<form onSubmit={saveEntry} className="hours-entry-form">
            <label className="hours-label">Date<input type="date" required value={form.date} onChange={e=>change("date",e.target.value)}/></label>
            <label className="hours-label hours-description">Travail effectué
              <select required value={service} onChange={e=>setService(e.target.value)}><option value="">Choisir une prestation</option>{services.map(x=><option key={x} value={x}>{x}</option>)}</select>
            </label>
            <label className="hours-label hours-description">Précisions (facultatif)
              <input maxLength={900} placeholder="Ex. Déménagement 3 pièces à Lausanne" value={details} onChange={e=>setDetails(e.target.value)}/>
            </label>
            <label className="hours-label">Heures<input required type="number" min="0.01" max="24" step="0.01" placeholder="2.5" value={form.hours} onChange={e=>change("hours",e.target.value)}/></label>
            <label className="hours-label">Montant (CHF)<input required type="number" min="0" max="1000000" step="0.01" placeholder="75.00" value={form.amount} onChange={e=>change("amount",e.target.value)}/></label>
            <div className="hours-form-actions"><button className="admin-primary" disabled={working}>{editingId?"Enregistrer la modification":"Ajouter l’intervention"}</button>{editingId&&<button type="button" className="hours-secondary" onClick={()=>{setEditingId(null);setForm(blank());setService("");setDetails("")}}>Annuler</button>}</div>
          </form>}
          <div className="hours-scroll"><table className="hours-table"><thead><tr><th>Date</th><th>Travail</th><th>Heures</th><th>Montant</th><th>Actions</th></tr></thead><tbody>{pending.map(l=><tr key={l.id}><td>{dateDisplay(l.date)}</td><td>{l.description}</td><td>{decimal(l.hours)} h</td><td>{francs(l.amountCents)}</td><td><button type="button" className="hours-link" disabled={personArchived} onClick={()=>startEdit(l)}>Modifier</button><button type="button" disabled={personArchived} className="hours-link hours-danger" onClick={()=>remove(l.id)}>Supprimer</button></td></tr>)}</tbody><tfoot><tr><th colSpan={2}>Grand total</th><th>{decimal(sums.hours)} h</th><th>{francs(sums.amount)}</th><th/></tr></tfoot></table>{!pending.length&&<p className="hours-empty">Aucune intervention en attente. Les anciennes restent dans l'historique.</p>}</div>
          {!personArchived&&<div className="hours-close"><label className="hours-label">Clôturer jusqu'au<input type="date" value={cutoff} onChange={e=>setCutoff(e.target.value)}/></label><button type="button" className="admin-primary" disabled={working||!pending.some(e=>e.date<=cutoff)} onClick={close}>Clôturer le décompte</button></div>}
        </section>
        <section className="hours-card">
          <h2>Historique des décomptes</h2>
          <p>Les anciennes versions restent accessibles. Vous pouvez corriger un décompte, ajouter ou retirer une intervention, ou le déplacer dans la corbeille.</p>
          {activeReports.length?<div className="hours-history">{activeReports.map(r=><button type="button" className={"hours-history-entry"+(selectedReport===r.id+":"+r.version?" selected":"")} key={r.id+":"+r.version} onClick={()=>chooseReport(r.id+":"+r.version)}>
            <span>Clôture du {dateDisplay(r.cutoffDate)} · Version {r.version}</span><strong>{decimal(total(r.lines).hours)} h · {francs(total(r.lines).amount)}</strong>
          </button>)}</div>:<p className="hours-empty">Aucun décompte actif dans l'historique.</p>}
          <details className="hours-trash"><summary>Corbeille ({new Set(trashReports.map(r=>r.id)).size} décompte(s))</summary>
            {trashReports.length?<div className="hours-history">{trashReports.map(r=><button type="button" className={"hours-history-entry"+(selectedReport===r.id+":"+r.version?" selected":"")} key={r.id+":"+r.version} onClick={()=>chooseReport(r.id+":"+r.version)}>
              <span>Corbeille · {dateDisplay(r.cutoffDate)} · Version {r.version}</span><strong>{decimal(total(r.lines).hours)} h · {francs(total(r.lines).amount)}</strong>
            </button>)}</div>:<p className="hours-empty">La corbeille est vide.</p>}
          </details>
          {report&&<div className="hours-report-preview"><h3>Décompte du {dateDisplay(report.cutoffDate)} — version {report.version}{report.deletedAt?" (corbeille)":""}</h3>
            <p className="hours-email-status">E-mail : {report.emailStatus==="sent"?"Envoyé à "+report.emailTo:report.emailStatus==="sending"?"Envoi en cours":report.emailStatus==="failed"?"Échec d'envoi":report.emailStatus==="skipped"?"Non envoyé (adresse absente ou prévisualisation)":"Pas encore envoyé"}
            {report.emailedAt&&" · "+new Date(report.emailedAt).toLocaleString("fr-CH",{timeZone:"Europe/Zurich"})}</p>
            <div className="hours-scroll"><table className="hours-table"><thead><tr><th>Date</th><th>Travail</th><th>Heures</th><th>Montant</th>{corrections&&<th>Action</th>}</tr></thead><tbody>{reportLines.map((l,i)=><tr key={l.id}>
              <td>{corrections?<input type="date" value={l.date} onChange={e=>editArchived(i,"date",e.target.value)}/>:dateDisplay(l.date)}</td>
              <td>{corrections?<input value={l.description} maxLength={1000} onChange={e=>editArchived(i,"description",e.target.value)}/>:l.description}</td>
              <td>{corrections?<input type="number" min="0.01" max="24" step="0.01" value={l.hours} onChange={e=>editArchived(i,"hours",e.target.value)}/>:decimal(l.hours)+" h"}</td>
              <td>{corrections?<input type="number" min="0" step="0.01" value={l.amountCents/100} onChange={e=>editArchived(i,"amountCents",e.target.value)}/>:francs(l.amountCents)}</td>
              {corrections&&<td><button type="button" className="hours-link hours-danger" onClick={()=>removeCorrection(l.id)}>Retirer</button></td>}
            </tr>)}</tbody><tfoot><tr><th colSpan={2}>Grand total</th><th>{decimal(reportTotal.hours)} h</th><th>{francs(reportTotal.amount)}</th>{corrections&&<th/>}</tr></tfoot></table></div>
            <div className="hours-buttons">
              {corrections?<><button className="hours-secondary" type="button" disabled={working} onClick={addCorrection}>+ Ajouter une intervention</button>
                <button className="admin-primary" type="button" onClick={saveRevision} disabled={working}>Enregistrer la version corrigée</button>
                <button className="hours-secondary" type="button" onClick={()=>setCorrections(null)}>Annuler</button></>:
                <><button className="admin-primary" type="button" onClick={()=>window.print()}>Imprimer / Enregistrer en PDF</button>
                  {!report.deletedAt&&["failed","skipped"].includes(report.emailStatus)&&<button className="hours-secondary" disabled={working} type="button" onClick={resend}>Renvoyer le PDF par e-mail</button>}
                  {report.deletedAt?<button className="hours-secondary" type="button" disabled={working} onClick={()=>reportAction("restore_report")}>Restaurer le décompte</button>:
                  <><button className="hours-secondary" type="button" disabled={working} onClick={startRevision}>Corriger ce décompte</button>
                    <button className="hours-secondary hours-destructive" type="button" disabled={working} onClick={()=>reportAction("trash_report")}>Mettre dans la corbeille</button></>}
                  <button className="hours-secondary hours-destructive" type="button" disabled={working} onClick={deleteReportPermanently}>Supprimer définitivement</button>
                </>}
            </div>
            {corrections&&<p className="hours-muted">L'original restera dans l'historique. Les totaux seront recalculés automatiquement.</p>}
          </div>}
        </section></>:<div className="hours-card"><p>Ajoutez une personne pour commencer.</p></div>}
      </div>
    </div>}
    {report&&!corrections&&<section className="hours-print">
      <h1>SUPER-SERVICE</h1><h2>Décompte des heures et des prestations</h2>
      <p className="hours-print-person"><strong>{visibleName}</strong></p>
      <p><strong>Décompte arrêté au :</strong> {dateDisplay(report.cutoffDate)} · <strong>Version :</strong> {report.version}</p>
      <table><thead><tr><th>Date</th><th>Travail effectué</th><th>Heures</th><th>Montant CHF</th></tr></thead><tbody>{report.lines.map(l=><tr key={l.id}><td>{dateDisplay(l.date)}</td><td>{l.description}</td><td>{decimal(l.hours)} h</td><td>{francs(l.amountCents)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>GRAND TOTAL</th><th>{decimal(total(report.lines).hours)} h</th><th>{francs(total(report.lines).amount)}</th></tr></tfoot></table>
      <p className="hours-print-date">Établi le {dateDisplay(currentDate())}</p>
      <p className="hours-print-note">Décompte des interventions — ne constitue pas une fiche de salaire.</p>
    </section>}
  </div>;
}
