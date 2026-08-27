"use client";

import {useEffect, useMemo, useState} from "react";
import type {Appointment} from "@/lib/appointment-types";
import {statusLabels} from "@/lib/appointment-types";

type View = "day" | "week" | "month" | "list";
type ReminderState = "loading" | "off" | "on" | "working" | "blocked" | "unsupported";
const parsedDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const dateKey = (value: string | Date | null | undefined) => {
  const parsed = parsedDate(value);
  return parsed ? new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit"}).format(parsed) : "";
};
const formatDate = (value: string | null, options: Intl.DateTimeFormatOptions = {dateStyle: "medium", timeStyle: "short"}) => {
  const parsed = parsedDate(value);
  return parsed ? new Intl.DateTimeFormat("fr-CH", {timeZone: "Europe/Zurich", ...options}).format(parsed) : "Date à définir";
};
const localInput = (value: string | null) => {
  const parsed = parsedDate(value);
  return parsed ? new Intl.DateTimeFormat("sv-SE", {timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}).format(parsed).replace(" ", "T") : "";
};
const phoneHref = (phone: string | null | undefined) => (phone || "").replace(/[^+\d]/g, "");
const validDateOnly = (value: string | null | undefined) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");
const availabilityStart = (date: string, time: string | null) => validDateOnly(date) ? `${date}T${time || "09:00"}` : "";
const availabilityLabel = (date: string, timeStart: string | null, timeEnd: string | null) => {
  if (!validDateOnly(date)) return "Date historique à vérifier";
  const parsed = parsedDate(`${date}T12:00:00Z`);
  if (!parsed) return "Date historique à vérifier";
  const day = new Intl.DateTimeFormat("fr-CH", {timeZone: "UTC", weekday: "short", day: "numeric", month: "long", year: "numeric"}).format(parsed);
  if (timeStart && timeEnd) return `${day}, de ${timeStart} à ${timeEnd}`;
  return timeStart ? `${day}, à ${timeStart}` : day;
};
const pushKey = (value: string) => {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(padded), character => character.charCodeAt(0));
};

export function Dashboard({initialAppointments, initialSelectedId}: {initialAppointments: Appointment[]; initialSelectedId?: string}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [view, setView] = useState<View>("day");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(() => initialAppointments.find(item => item.id === initialSelectedId) || null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [notice, setNotice] = useState("");
  const [reminderState, setReminderState] = useState<ReminderState>("loading");
  const [reminderMessage, setReminderMessage] = useState("");

  async function refresh() {
    const response = await fetch("/api/gestion/rendez-vous", {cache: "no-store"});
    if (response.ok) setAppointments((await response.json()).appointments);
  }

  useEffect(() => {
    const reminderStatus=async():Promise<ReminderState>=>{
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined")return "unsupported";
      try{
        await navigator.serviceWorker.register("/sw.js");
        const registration=await navigator.serviceWorker.ready;
        const subscription=await registration.pushManager.getSubscription();
        return subscription?"on":Notification.permission==="denied"?"blocked":"off";
      }catch{return "unsupported"}
    };
    reminderStatus().then(setReminderState);
    const timer = window.setInterval(refresh, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const seen = JSON.parse(sessionStorage.getItem("appointment-notifications") || "[]") as string[];
    const notify = appointments.filter(item => !seen.includes(item.id) && item.status === "new_request");
    notify.forEach(item => new Notification("Nouvelle demande Super-Service", {body: `${item.customerName} · ${item.requestType}`}));
    sessionStorage.setItem("appointment-notifications", JSON.stringify([...new Set([...seen, ...notify.map(item => item.id)])].slice(-100)));
  }, [appointments]);

  async function toggleReminders(){
    if(reminderState==="working"||reminderState==="loading")return;
    setReminderMessage("");
    if(reminderState==="unsupported"){
      setReminderMessage("Sur iPhone, ajoutez d’abord l’application à l’écran d’accueil. Sur Android, utilisez Chrome.");
      return;
    }
    setReminderState("working");
    try{
      const registration=await navigator.serviceWorker.ready;
      const existing=await registration.pushManager.getSubscription();
      if(existing){
        await fetch("/api/gestion/push",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({endpoint:existing.endpoint})});
        await existing.unsubscribe();
        setReminderState("off");
        setReminderMessage("Rappels désactivés sur ce téléphone.");
        return;
      }
      const permission=await Notification.requestPermission();
      if(permission!=="granted"){
        setReminderState("blocked");
        setReminderMessage("Notifications refusées. Autorisez-les dans les réglages du téléphone pour activer les rappels.");
        return;
      }
      const configuration=await fetch("/api/gestion/push",{cache:"no-store"});
      if(!configuration.ok)throw new Error("Push configuration unavailable");
      const {publicKey}=await configuration.json();
      const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(publicKey)});
      const response=await fetch("/api/gestion/push",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({subscription:subscription.toJSON()})});
      if(!response.ok){await subscription.unsubscribe();throw new Error("Push registration failed")}
      setReminderState("on");
      setReminderMessage("Rappels activés : une notification sera envoyée une heure avant chaque rendez-vous.");
    }catch(error){
      console.error("Reminder toggle failed",error);
      setReminderState("off");
      setReminderMessage("Impossible de modifier les rappels pour le moment.");
    }
  }

  const filtered = useMemo(() => appointments.filter(item => {
    const text = `${item.customerName} ${item.customerEmail} ${item.customerPhone} ${item.reason} ${item.customerAddress}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!status || item.status === status) && (!type || item.requestType === type);
  }), [appointments, query, status, type]);
  const today = dateKey(new Date());
  const todayItems = filtered.filter(item => item.startsAt && dateKey(item.startsAt) === today);
  const newCount = appointments.filter(item => item.status === "new_request").length;
  const types = [...new Set(appointments.map(item => item.requestType))].sort();

  function open(item: Appointment) {setSelected(item); setNotice("");}
  async function move(item: Appointment, day: string) {
    if (!item.startsAt) return;
    const start = `${day}T${localInput(item.startsAt).slice(11)}`;
    const response = await fetch(`/api/gestion/rendez-vous/${item.id}`, {method: "PATCH", headers: {"content-type": "application/json"}, body: JSON.stringify({action: "propose", startsAt: start, adminNotes: item.adminNotes || ""})});
    if (response.ok) {
      const data = await response.json();
      setAppointments(current => current.map(existing => existing.id === item.id ? data.appointment : existing));
    }
  }

  return <div className="admin-app">
    <header className="admin-top"><div><span className="admin-brand">SUPER-SERVICE</span><p>Gestion des rendez-vous</p></div><div className="top-actions"><button className={`notification-button reminder-${reminderState}`} onClick={toggleReminders} aria-pressed={reminderState==="on"} disabled={reminderState==="working"||reminderState==="loading"} title={reminderState==="on"?"Désactiver les rappels":"Activer les rappels"}><span aria-hidden="true">{reminderState==="on"?"🔔":"🔕"}</span><small>{reminderState==="on"?"Rappels actifs":"Rappels inactifs"}</small></button><form action="/api/gestion/auth/logout" method="post"><button className="admin-ghost">Déconnexion</button></form></div></header>
    <main className="admin-main">
      {reminderMessage&&<p className={`reminder-message ${reminderState==="on"?"success":""}`} role="status">{reminderMessage}</p>}
      <section className="today-hero"><div><p className="admin-kicker">Aujourd’hui</p><h1>{todayItems.length} rendez-vous</h1><p>{newCount ? `${newCount} nouvelle${newCount > 1 ? "s" : ""} demande${newCount > 1 ? "s" : ""} à traiter` : "Toutes les demandes sont traitées"}</p></div><button className="admin-primary" onClick={() => setManual(true)}>＋ Ajouter</button></section>
      <section className="admin-tools"><input aria-label="Rechercher" placeholder="Rechercher un client, téléphone, adresse…" value={query} onChange={event => setQuery(event.target.value)}/><select aria-label="Filtrer par statut" value={status} onChange={event => setStatus(event.target.value)}><option value="">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select aria-label="Filtrer par type" value={type} onChange={event => setType(event.target.value)}><option value="">Tous les types</option>{types.map(value => <option value={value} key={value}>{value}</option>)}</select></section>
      <nav className="view-tabs" aria-label="Vue calendrier">{(["day", "week", "month"] as View[]).map(value => <button key={value} className={view === value ? "active" : ""} onClick={() => setView(value)}>{{day: "Jour", week: "Semaine", month: "Mois", list: "Liste"}[value]}</button>)}</nav>
      <CalendarContent view={view} appointments={filtered} onOpen={open} onMove={move} onSelectDay={setSelectedDay}/>
    </main>
    <footer className="admin-bottom"><button className={view === "day" ? "active" : ""} onClick={() => setView("day")}><span>⌂</span>Accueil</button><button className={view === "week" || view === "month" ? "active" : ""} onClick={() => setView("month")}><span>▦</span>Calendrier</button><button className={view === "list" ? "active" : ""} onClick={() => {setStatus("new_request"); setView("list");}}><span className="counter-icon">◎{newCount > 0 && <b>{newCount}</b>}</span>Demandes</button><button onClick={() => setManual(true)}><span>＋</span>Ajouter</button></footer>
    {selectedDay && <DayAppointmentsPanel day={selectedDay} appointments={filtered} onClose={() => setSelectedDay(null)} onOpen={item => {setSelectedDay(null); open(item);}}/>}
    {selected && <AppointmentPanel key={selected.id} appointment={selected} onClose={() => setSelected(null)} onSaved={item => {setAppointments(current => current.map(existing => existing.id === item.id ? item : existing)); setSelected(item);}} onDeleted={() => {setAppointments(current => current.filter(item => item.id !== selected.id)); setSelected(null); setSelectedDay(null);}} notice={notice} setNotice={setNotice}/>}
    {manual && <ManualForm onClose={() => setManual(false)} onCreated={item => {setAppointments(current => [item, ...current]); setManual(false);}}/>}
  </div>;
}

function CalendarContent({view, appointments, onOpen, onMove, onSelectDay}: {view: View; appointments: Appointment[]; onOpen: (item: Appointment) => void; onMove: (item: Appointment, day: string) => void; onSelectDay: (day: string) => void}) {
  const today = new Date();
  if (view === "day") return <AppointmentList title="Rendez-vous du jour" items={appointments.filter(item => item.startsAt && dateKey(item.startsAt) === dateKey(today))} onOpen={onOpen}/>;
  if (view === "list") return <AppointmentList title="Prochains rendez-vous et demandes" items={appointments} onOpen={onOpen}/>;
  if (view === "week") {
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const days = Array.from({length: 7}, (_, index) => {const day = new Date(monday); day.setDate(monday.getDate() + index); return day;});
    return <section className="week-grid">{days.map(day => <div className={dateKey(day) === dateKey(today) ? "week-day current" : "week-day"} key={dateKey(day)} onDragOver={event => event.preventDefault()} onDrop={event => {const item = appointments.find(value => value.id === event.dataTransfer.getData("text/appointment")); if (item) onMove(item, dateKey(day));}}><h3>{formatDate(day.toISOString(), {weekday: "short", day: "numeric"})}</h3>{appointments.filter(item => item.startsAt && dateKey(item.startsAt) === dateKey(day)).map(item => <button draggable onDragStart={event => event.dataTransfer.setData("text/appointment", item.id)} className={`mini-event status-${item.status}`} key={item.id} onClick={() => onOpen(item)}><strong>{formatDate(item.startsAt, {hour: "2-digit", minute: "2-digit"})}</strong>{item.customerName}</button>)}</div>)}</section>;
  }
  const first = new Date(today.getFullYear(), today.getMonth(), 1); const offset = (first.getDay() + 6) % 7; const start = new Date(first); start.setDate(1 - offset);
  const days = Array.from({length: 42}, (_, index) => {const day = new Date(start); day.setDate(start.getDate() + index); return day;});
  return <section className="month-calendar"><div className="month-title">{formatDate(today.toISOString(), {month: "long", year: "numeric"})}</div><p className="month-help">Touchez une date pour voir ses rendez-vous.</p><div className="month-grid">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(label => <b className="weekday" key={label}>{label}</b>)}{days.map(day => {
    const dayId = dateKey(day); const events = appointments.filter(item => item.startsAt && dateKey(item.startsAt) === dayId);
    return <div className={`month-day ${day.getMonth() !== today.getMonth() ? "muted" : ""} ${dayId === dateKey(today) ? "current" : ""}`} key={dayId} role="button" tabIndex={0} aria-label={`${formatDate(day.toISOString(), {weekday: "long", day: "numeric", month: "long"})}, ${events.length} rendez-vous`} onClick={() => onSelectDay(dayId)} onKeyDown={event => {if (event.key === "Enter" || event.key === " ") {event.preventDefault(); onSelectDay(dayId);}}} onDragOver={event => event.preventDefault()} onDrop={event => {event.stopPropagation(); const item = appointments.find(value => value.id === event.dataTransfer.getData("text/appointment")); if (item) onMove(item, dayId);}}><span>{day.getDate()}</span>{events.slice(0, 3).map(item => <button className={`month-event status-${item.status}`} draggable onDragStart={event => event.dataTransfer.setData("text/appointment", item.id)} key={item.id} onClick={event => {event.stopPropagation(); onOpen(item);}} title={item.customerName}>{item.customerName}</button>)}{events.length > 3 && <small>+{events.length - 3}</small>}</div>;
  })}</div></section>;
}

function DayAppointmentsPanel({day, appointments, onClose, onOpen}: {day: string; appointments: Appointment[]; onClose: () => void; onOpen: (item: Appointment) => void}) {
  const items = appointments.filter(item => item.startsAt && dateKey(item.startsAt) === day);
  const title = new Intl.DateTimeFormat("fr-CH", {timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric"}).format(new Date(`${day}T12:00:00Z`));
  return <div className="panel-backdrop" onMouseDown={event => {if (event.target === event.currentTarget) onClose();}}><aside className="detail-panel day-panel"><button className="panel-close" onClick={onClose}>×</button><p className="admin-kicker">Journée sélectionnée</p><h2>{title}</h2><p className="day-panel-help">Sélectionnez un rendez-vous pour le modifier ou le supprimer.</p><AppointmentList title="Rendez-vous" items={items} onOpen={onOpen}/></aside></div>;
}

function AppointmentList({title, items, onOpen}: {title: string; items: Appointment[]; onOpen: (item: Appointment) => void}) {
  return <section><div className="section-heading"><h2>{title}</h2><span>{items.length}</span></div><div className="appointment-list">{items.length === 0 ? <div className="empty-state">Aucun rendez-vous dans cette vue.</div> : items.map(item => <article className="appointment-card" key={item.id}><button className="card-main" onClick={() => onOpen(item)}><span className={`status-dot status-${item.status}`}/><span><strong>{item.customerName}</strong><small>{item.requestType} · {item.reason}</small><small>{item.startsAt ? formatDate(item.startsAt) : `Souhaité le ${item.preferredDate}${item.preferredTimeStart ? ` à ${item.preferredTimeStart}` : ""}`}</small></span><em>{statusLabels[item.status]}</em></button><div className="quick-actions"><a href={`tel:${phoneHref(item.customerPhone)}`}>Appeler</a><a href={`https://wa.me/${phoneHref(item.customerPhone).replace("+", "")}`} target="_blank">WhatsApp</a>{item.status === "new_request" && <button onClick={() => onOpen(item)}>Traiter</button>}</div></article>)}</div></section>;
}

function AppointmentPanel({appointment, onClose, onSaved, onDeleted, notice, setNotice}: {appointment: Appointment; onClose: () => void; onSaved: (item: Appointment) => void; onDeleted: () => void; notice: string; setNotice: (value: string) => void}) {
  const [customerName, setCustomerName] = useState(appointment.customerName); const [customerEmail, setCustomerEmail] = useState(appointment.customerEmail); const [customerPhone, setCustomerPhone] = useState(appointment.customerPhone); const [customerAddress, setCustomerAddress] = useState(appointment.customerAddress); const [requestType, setRequestType] = useState(appointment.requestType); const [reason, setReason] = useState(appointment.reason);
  const [start, setStart] = useState(localInput(appointment.startsAt) || availabilityStart(appointment.preferredDate, appointment.preferredTimeStart)); const [notes, setNotes] = useState(appointment.adminNotes || ""); const [saving, setSaving] = useState(false); const [showProposal, setShowProposal] = useState(false);
  async function act(action: string, selectedStart?: string) {
    setSaving(true); setNotice("");
    const response = await fetch(`/api/gestion/rendez-vous/${appointment.id}`, {method: "PATCH", headers: {"content-type": "application/json"}, body: JSON.stringify({action, startsAt: selectedStart, adminNotes: notes, customerName, customerEmail, customerPhone, customerAddress, requestType, reason})});
    const data = await response.json(); setSaving(false);
    if (response.ok) {
      if (selectedStart) setStart(selectedStart); setShowProposal(false); onSaved(data.appointment);
      const messages: Record<string, string> = {accept: "Rendez-vous confirmé et client informé.", propose: "Nouvelle date proposée et client informé.", reject: "Demande refusée et client informé.", cancel: "Rendez-vous annulé et client informé.", save: "Modifications enregistrées."};
      setNotice(data.emailSent === false ? "Enregistré, mais l’e-mail au client n’a pas pu être envoyé." : messages[action] || "Modification enregistrée.");
    } else setNotice(data.error || "Impossible d’enregistrer");
  }
  async function remove() {
    if (!window.confirm(`Supprimer définitivement le rendez-vous de ${customerName} ?`)) return;
    setSaving(true); setNotice(""); const response = await fetch(`/api/gestion/rendez-vous/${appointment.id}`, {method: "DELETE"}); const data = await response.json().catch(() => ({})); setSaving(false);
    if (response.ok) onDeleted(); else setNotice(data.error || "Suppression impossible");
  }
  const isNewClientRequest = appointment.source === "client" && appointment.status === "new_request";
  const firstStart = availabilityStart(appointment.preferredDate, appointment.preferredTimeStart);
  return <div className="panel-backdrop" onMouseDown={event => {if (event.target === event.currentTarget) onClose();}}><aside className="detail-panel"><button className="panel-close" onClick={onClose}>×</button><span className={`status-pill status-${appointment.status}`}>{statusLabels[appointment.status]}</span><h2>{customerName}</h2><p className="detail-reason">{requestType} — {reason}</p><div className="contact-buttons"><a href={`tel:${phoneHref(customerPhone)}`}>☎ Appeler</a><a href={`https://wa.me/${phoneHref(customerPhone).replace("+", "")}`} target="_blank">WhatsApp</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`} target="_blank">Itinéraire</a></div><dl><dt>Date souhaitée</dt><dd>{availabilityLabel(appointment.preferredDate, appointment.preferredTimeStart, null)}</dd><dt>Origine</dt><dd>{appointment.source === "client" ? "Demande client" : "Ajout manuel"}</dd></dl>
    {isNewClientRequest && <section className="availability-actions" aria-labelledby="availability-title"><h3 id="availability-title">Valider la demande</h3><button className="availability-choice" disabled={saving || !firstStart} onClick={() => act("accept", firstStart)}><strong>Valider le rendez-vous</strong><span>{availabilityLabel(appointment.preferredDate, appointment.preferredTimeStart, null)}</span></button></section>}
    {appointment.status === "awaiting_customer" && <p className="proposal-pending">Ce créneau est réservé provisoirement et affiché en orange dans le calendrier jusqu’à la réponse du client.</p>}
    <section className="editable-details" aria-labelledby="details-title"><h3 id="details-title">Informations du rendez-vous</h3><label>Nom et prénom<input value={customerName} onChange={event => setCustomerName(event.target.value)}/></label><label>E-mail<input type="email" value={customerEmail} onChange={event => setCustomerEmail(event.target.value)}/></label><label>Téléphone<input value={customerPhone} onChange={event => setCustomerPhone(event.target.value)}/></label><label>Adresse<input value={customerAddress} onChange={event => setCustomerAddress(event.target.value)}/></label><label>Type<select value={requestType} onChange={event => setRequestType(event.target.value)}><option value="visite">Visite</option><option value="demenagement">Déménagement</option><option value="nettoyage">Nettoyage</option><option value="travaux">Travaux</option><option value="livraison">Livraison</option><option value="debarras">Débarras</option><option value="autre">Autre</option></select></label><label>Motif<textarea rows={3} value={reason} onChange={event => setReason(event.target.value)}/></label></section>
    {showProposal && <section className="proposal-editor"><h3>Proposer une nouvelle date</h3><p>Le client recevra un e-mail avec un bouton pour accepter ce créneau.</p><label>Nouvelle date et heure<input type="datetime-local" value={start} onChange={event => setStart(event.target.value)} required/></label><div><button className="modify" disabled={saving || !start} onClick={() => act("propose", start)}>Envoyer la proposition</button><button className="admin-ghost" disabled={saving} onClick={() => setShowProposal(false)}>Annuler</button></div></section>}
    <label>Notes internes<textarea rows={4} value={notes} onChange={event => setNotes(event.target.value)}/></label>{notice && <p className="panel-notice">{notice}</p>}<div className="decision-buttons"><button className="accept" disabled={saving} onClick={() => act("save")}>Enregistrer les informations</button><button className="modify" disabled={saving} onClick={() => setShowProposal(value => !value)}>{showProposal ? "Fermer la proposition" : "Proposer une autre date"}</button>{isNewClientRequest && <button className="danger" disabled={saving} onClick={() => act("reject")}>Refuser</button>}{appointment.status !== "cancelled" && <button className="danger ghost" disabled={saving} onClick={() => act("cancel")}>Annuler et informer le client</button>}<button className="delete-button" disabled={saving} onClick={remove}>Supprimer définitivement</button></div></aside></div>;
}

function ManualForm({onClose, onCreated}: {onClose: () => void; onCreated: (item: Appointment) => void}) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {event.preventDefault(); setSaving(true); const body = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/gestion/rendez-vous", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify(body)}); const data = await response.json(); setSaving(false); if (response.ok) onCreated(data.appointment); else setError(data.error || "Création impossible");}
  return <div className="panel-backdrop"><aside className="detail-panel"><button className="panel-close" onClick={onClose}>×</button><h2>Nouveau rendez-vous</h2><form className="manual-form" onSubmit={submit}><label>Nom et prénom<input name="name" required/></label><label>E-mail<input type="email" name="email" required/></label><label>Téléphone<input name="phone" required/></label><label>Adresse<input name="address" required/></label><label>Type<select name="requestType" required><option value="visite">Visite</option><option value="demenagement">Déménagement</option><option value="nettoyage">Nettoyage</option><option value="travaux">Travaux</option><option value="livraison">Livraison</option><option value="debarras">Débarras</option><option value="autre">Autre</option></select></label><label>Motif<textarea name="reason" required/></label><label>Date et heure<input type="datetime-local" name="startsAt" required/></label><label>Notes internes<textarea name="adminNotes"/></label>{error && <p className="admin-error">{error}</p>}<button className="admin-primary" disabled={saving}>{saving ? "Création…" : "Créer le rendez-vous"}</button></form></aside></div>;
}
