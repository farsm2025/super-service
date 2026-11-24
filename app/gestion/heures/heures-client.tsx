"use client";
import {useEffect,useMemo,useState} from "react";
type Person={id:string;firstName:string;lastName:string};
type Line={id:string;date:string;description:string;hours:number;amountCents:number;personId?:string};
type Report={id:string;personId:string;cutoffDate:string;createdAt:string;version:number;lines:Line[]};
type State={people:Person[];entries:Line[];reports:Report[]};
const empty={people:[],entries:[],reports:[]} as State;
const currentDate=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Zurich"});
const francs=(cents:number)=>new Intl.NumberFormat("fr-CH",{style:"currency",currency:"CHF"}).format(cents/100);
const decimal=(n:number)=>new Intl.NumberFormat("fr-CH",{maximumFractionDigits:2}).format(n);
const dateDisplay=(d:string)=>d.split("-").reverse().join(".");
const blank=()=>({date:currentDate(),description:"",hours:"",amount:""});
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
  const [name,setName]=useState({firstName:"",lastName:""});
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
  const pending=data.entries.filter(e=>e.personId===personId).sort((a,b)=>a.date.localeCompare(b.date));
  const sums=total(pending);
  const reports=data.reports.filter(r=>r.personId===personId);
  const report=reports.find(r=>r.id+":"+r.version===selectedReport)||null;
  const reportLines=corrections??report?.lines??[];
  const reportTotal=total(reportLines);
  function chooseReport(value:string){setSelectedReport(value);setCorrections(null)}
  function change<K extends keyof Editor>(key:K,value:Editor[K]){setForm(f=>({...f,[key]:value}))}
  async function addPerson(event:React.FormEvent){
    event.preventDefault();const ok=await run({action:"person",...name},"Personne enregistrée.");
    if(ok){setName({firstName:"",lastName:""});}
  }
  async function saveEntry(event:React.FormEvent){
    event.preventDefault();if(!personId)return;
    const ok=await run({action:"entry",personId,...form,...(editingId?{id:editingId}:{})},editingId?"Intervention modifiée.":"Intervention ajoutée.");
    if(ok){setEditingId(null);setForm(blank())}
  }
  function startEdit(line:Line){setEditingId(line.id);setForm(normalize(line));window.scrollTo({top:0,behavior:"smooth"})}
  async function remove(id:string){
    if(!window.confirm("Supprimer cette intervention non clôturée ?"))return;
    await run({action:"delete",id,personId},"Intervention supprimée.");
  }
  async function close(){
    const toClose=pending.filter(e=>e.date<=cutoff);
    if(!toClose.length){setError("Aucune intervention à clôturer pour cette date.");return}
    if(!window.confirm("Clôturer "+decimal(total(toClose).hours)+" heures et "+francs(total(toClose).amount)+" jusqu'au "+dateDisplay(cutoff)+" ? Les lignes seront archivées."))return;
    const ok=await run({action:"close",personId,cutoffDate:cutoff},"Décompte clôturé et conservé dans l’historique.");
    if(ok){const fresh=await request() as unknown as State;const chosen=fresh.reports.find(r=>r.personId===personId);if(chosen)setSelectedReport(chosen.id+":"+chosen.version);setCorrections(null)}
  }
  function startRevision(){
    if(!report)return;
    if(!window.confirm("Créer une nouvelle version de ce décompte ? L'original restera dans l'historique."))return;
    setCorrections(report.lines.map(x=>({...x})));
  }
  function editArchived(index:number,key:"date"|"description"|"hours"|"amountCents",value:string){
    setCorrections(lines=>lines?.map((l,i)=>i===index?{...l,[key]:key==="hours"?Number(value):key==="amountCents"?Math.round(Number(value)*100):value}:l)||null);
  }
  async function saveRevision(){
    if(!report||!corrections)return;
    const ok=await run({action:"revise",reportId:report.id,lines:corrections.map(l=>({id:l.id,date:l.date,description:l.description,hours:l.hours,amount:l.amountCents/100}))},"Nouvelle version enregistrée. La précédente reste disponible.");
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
            {data.people.map(p=><option value={p.id} key={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
        </label>
        <form onSubmit={addPerson} className="hours-person-form"><h3>Ajouter une personne</h3>
          <label className="hours-label">Prénom<input required maxLength={100} value={name.firstName} onChange={e=>setName(n=>({...n,firstName:e.target.value}))}/></label>
          <label className="hours-label">Nom<input required maxLength={100} value={name.lastName} onChange={e=>setName(n=>({...n,lastName:e.target.value}))}/></label>
          <button className="hours-secondary" disabled={working}>+ Ajouter la personne</button>
        </form>
      </aside>
      <div className="hours-content">
        {person?<><section className="hours-card"><div className="hours-title"><div><p className="admin-kicker">Interventions non clôturées</p><h2>{visibleName}</h2></div><div className="hours-totals"><span>{decimal(sums.hours)} h</span><strong>{francs(sums.amount)}</strong></div></div>
          <form onSubmit={saveEntry} className="hours-entry-form">
            <label className="hours-label">Date<input type="date" required value={form.date} onChange={e=>change("date",e.target.value)}/></label>
            <label className="hours-label hours-description">Travail effectué<input required maxLength={1000} placeholder="Déménagement, transport…" value={form.description} onChange={e=>change("description",e.target.value)}/></label>
            <label className="hours-label">Heures<input required type="number" min="0.01" max="24" step="0.01" placeholder="2.5" value={form.hours} onChange={e=>change("hours",e.target.value)}/></label>
            <label className="hours-label">Montant (CHF)<input required type="number" min="0" max="1000000" step="0.01" placeholder="75.00" value={form.amount} onChange={e=>change("amount",e.target.value)}/></label>
            <div className="hours-form-actions"><button className="admin-primary" disabled={working}>{editingId?"Enregistrer la modification":"Ajouter l’intervention"}</button>{editingId&&<button type="button" className="hours-secondary" onClick={()=>{setEditingId(null);setForm(blank())}}>Annuler</button>}</div>
          </form>
          <div className="hours-scroll"><table className="hours-table"><thead><tr><th>Date</th><th>Travail</th><th>Heures</th><th>Montant</th><th>Actions</th></tr></thead><tbody>{pending.map(l=><tr key={l.id}><td>{dateDisplay(l.date)}</td><td>{l.description}</td><td>{decimal(l.hours)} h</td><td>{francs(l.amountCents)}</td><td><button type="button" className="hours-link" onClick={()=>startEdit(l)}>Modifier</button><button type="button" className="hours-link hours-danger" onClick={()=>remove(l.id)}>Supprimer</button></td></tr>)}</tbody><tfoot><tr><th colSpan={2}>Grand total</th><th>{decimal(sums.hours)} h</th><th>{francs(sums.amount)}</th><th/></tr></tfoot></table>{!pending.length&&<p className="hours-empty">Aucune intervention en attente. Les anciennes restent dans l'historique.</p>}</div>
          <div className="hours-close"><label className="hours-label">Clôturer jusqu'au<input type="date" value={cutoff} onChange={e=>setCutoff(e.target.value)}/></label><button type="button" className="admin-primary" disabled={working||!pending.some(e=>e.date<=cutoff)} onClick={close}>Clôturer le décompte</button></div>
        </section>
        <section className="hours-card"><h2>Historique des décomptes</h2><p>Chaque version reste consultable et téléchargeable en PDF.</p>{reports.length?<div className="hours-history">{reports.map(r=><button className={"hours-history-entry"+(selectedReport===r.id+":"+r.version?" selected":"")} key={r.id+":"+r.version} onClick={()=>chooseReport(r.id+":"+r.version)}><span>Clôture du {dateDisplay(r.cutoffDate)} · Version {r.version}</span><strong>{decimal(total(r.lines).hours)} h · {francs(total(r.lines).amount)}</strong></button>)}</div>:<p className="hours-empty">Aucun décompte clôturé.</p>}
          {report&&<div className="hours-report-preview"><h3>Décompte du {dateDisplay(report.cutoffDate)} — version {report.version}</h3><div className="hours-scroll"><table className="hours-table"><thead><tr><th>Date</th><th>Travail</th><th>Heures</th><th>Montant</th></tr></thead><tbody>{reportLines.map((l,i)=><tr key={l.id}><td>{corrections?<input type="date" value={l.date} onChange={e=>editArchived(i,"date",e.target.value)}/>:dateDisplay(l.date)}</td><td>{corrections?<input value={l.description} maxLength={1000} onChange={e=>editArchived(i,"description",e.target.value)}/>:l.description}</td><td>{corrections?<input type="number" min="0.01" max="24" step="0.01" value={l.hours} onChange={e=>editArchived(i,"hours",e.target.value)}/>:decimal(l.hours)+" h"}</td><td>{corrections?<input type="number" min="0" step="0.01" value={l.amountCents/100} onChange={e=>editArchived(i,"amountCents",e.target.value)}/>:francs(l.amountCents)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>Grand total</th><th>{decimal(reportTotal.hours)} h</th><th>{francs(reportTotal.amount)}</th></tr></tfoot></table></div>
            <div className="hours-buttons">{corrections?<><button className="admin-primary" onClick={saveRevision} disabled={working}>Enregistrer une nouvelle version</button><button className="hours-secondary" onClick={()=>setCorrections(null)}>Annuler</button></>:<><button className="admin-primary" onClick={()=>window.print()}>Imprimer / Enregistrer en PDF</button><button className="hours-secondary" onClick={startRevision}>Corriger ce décompte</button></>}</div>
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
