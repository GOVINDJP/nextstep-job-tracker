"use client";
import { useEffect, useState } from "react";
import { readApplications, writeApplications, storageKey } from "./storage";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Layers3, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const stages = ["Wishlist", "Applied", "Interview", "Offer", "Rejected", "Withdrawn"];
type Application = { id: string; company: string; role: string; stage: string; interview: string; notes: string; created: string };
const blank = { company: "", role: "", stage: "Applied", interview: "", notes: "" };
const dateLabel = (value: string) => new Date(value + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function Home() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [removing, setRemoving] = useState<Application | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { setItems(readApplications()); }
    catch(e) { setError(e instanceof Error ? e.message : "Browser storage is unavailable."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { const sync=(e:StorageEvent)=>{if(e.key===storageKey || e.key===null)load();}; window.addEventListener("storage",sync); return ()=>window.removeEventListener("storage",sync); }, []);
  function edit(item?: Application) { setEditing(item || null); setForm(item ? {company:item.company,role:item.role,stage:item.stage,interview:item.interview,notes:item.notes} : blank); setFormError(""); setOpen(true); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setFormError("");
    try {
      const current=readApplications();
      const company=form.company.trim(), role=form.role.trim();
      if(!company || !role) throw Error("Enter a company and role, not just spaces.");
      if(editing && JSON.stringify(current.find(a=>a.id===editing.id))!==JSON.stringify(editing)) throw Error("This application changed in another tab. Close this form and reopen it to use the latest version.");
      const application={...form,company,role,id:editing?.id || crypto.randomUUID(),created:editing?.created || new Date().toISOString()};
      const next=editing ? current.map(a=>a.id===editing.id?application:a) : [application,...current];
      writeApplications(next); setItems(next); setOpen(false); setNotice(editing?"Application updated.":"Application added.");
    } catch(e) { setFormError(e instanceof Error ? e.message : "Couldn’t save. Please try again."); } finally {setBusy(false);}
  }
  async function remove() {
    if (!removing) return; setBusy(true); setFormError("");
    try {const current=readApplications(); const latest=current.find(a=>a.id===removing.id);if(latest && JSON.stringify(latest)!==JSON.stringify(removing))throw Error("This application changed in another tab. Close and reopen this confirmation.");const next=current.filter(a=>a.id!==removing.id);writeApplications(next);setItems(next);setRemoving(null);setNotice("Application removed.");}
    catch(e) {setFormError(e instanceof Error ? e.message : "Couldn’t remove this application. Please try again.");} finally {setBusy(false);}
  }

  const today = new Date(); const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const upcoming = items.filter(a=>a.interview && a.interview>=localDate && !["Rejected","Withdrawn"].includes(a.stage)).sort((a,b)=>a.interview.localeCompare(b.interview));
  const count = (stage:string)=>items.filter(a=>a.stage===stage).length;
  const active = items.filter(a=>["Applied","Interview","Offer"].includes(a.stage)).length;
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="./" aria-label="Nextstep home"><span className="brand-icon"><ArrowUpRight size={25}/></span>nextstep<span className="brand-period">.</span></a><div className="side-label">YOUR WORKSPACE</div><div className="side-active"><Layers3 size={19}/> Applications <span>{items.length}</span></div><div className="sidebar-bottom"><span className="avatar">ME</span><div>My job search<small>One step at a time</small></div></div></aside>
    <main><header className="topbar"><span>Workspace <ChevronRight size={14}/> <strong>Applications</strong></span><span className="private-label">Personal tracker</span></header>
      <div className="workspace"><div className="page-heading"><div><div className="eyebrow">YOUR NEXT CHAPTER</div><h1>Applications</h1><p>Keep your opportunities moving forward.</p></div><button className="primary" onClick={()=>edit()} disabled={loading || !!error}><Plus size={19}/> Add application</button></div>
      <div className="stats"><section className="stat"><span>Total applications <BriefcaseBusiness size={19}/></span><strong>{loading || error ? "—" : items.length}</strong><small>Every opportunity, in one place</small></section><section className="stat"><span>In progress <ArrowUpRight size={19}/></span><strong>{loading || error ? "—" : active}</strong><small>Applied, interviewing, or offered</small></section><section className="stat"><span>Interviewing <CalendarDays size={19}/></span><strong>{loading || error ? "—" : count("Interview")}</strong><small>Conversations in motion</small></section><section className="stat offer"><span>Offers <Check size={19}/></span><strong>{loading || error ? "—" : count("Offer")}</strong><small>A step closer to your next role</small></section></div>
      <div className="content-grid"><section className="applications panel"><div className="section-heading"><h2>All applications <span className="count">{items.length}</span></h2><span>Most recently added</span></div>
      {notice && <div className="notice" role="status"><Check size={16}/>{notice}</div>}
      {loading ? <div className="empty">Loading your applications…</div> : error ? <div className="empty" role="alert"><p>{error}</p><button onClick={load}>Try again</button></div> : items.length===0 ? <div className="empty"><div className="empty-icon"><BriefcaseBusiness size={30}/></div><h3>Your next opportunity starts here</h3><p>Add your first application to track its progress,<br/>interview date, and all the details that matter.</p><button className="primary" onClick={()=>edit()}><Plus size={18}/> Add your first application</button></div> : <div className="application-list">{items.map(a=><article className="application" key={a.id}><div className="company-icon">{a.company.slice(0,2).toUpperCase()}</div><div className="application-info"><h3>{a.company}</h3><p>{a.role}</p><div className="application-meta"><span className={`badge stage-${a.stage.toLowerCase()}`}>{a.stage}</span>{a.interview && <span><CalendarDays size={14}/>{dateLabel(a.interview)}</span>}</div>{a.notes && <p className="notes">{a.notes}</p>}</div><div className="row-actions"><button className="icon-button" title={`Edit ${a.company}`} aria-label={`Edit ${a.company}`} onClick={()=>edit(a)}><Pencil size={17}/></button><button className="icon-button delete" title={`Remove ${a.company}`} aria-label={`Remove ${a.company}`} onClick={()=>{setFormError("");setRemoving(a);}}><Trash2 size={17}/></button></div></article>)}</div>}
      </section><aside className="right-column"><section className="panel pipeline"><div className="section-heading"><h2>At a glance</h2><Layers3 size={18}/></div><div className="pipeline-body">{stages.map(s=><div className="pipeline-row" key={s}><div><span className={`stage-dot stage-${s.toLowerCase()}`}/><span>{s}</span><strong>{loading || error ? "—" : count(s)}</strong></div><div className="track"><div className={`fill stage-${s.toLowerCase()}`} style={{width: `${items.length ? count(s)/items.length*100 : 0}%`}}/></div></div>)}</div></section><section className="panel agenda"><div className="section-heading"><h2>Upcoming interviews</h2><CalendarDays size={18}/></div>{loading || error ? <div className="agenda-empty">{loading ? "Loading interviews…" : "Interviews unavailable"}</div> : upcoming.length ? upcoming.map(a=><button className="interview" key={a.id} onClick={()=>edit(a)}><span className="date-tile"><small>{new Date(a.interview+"T12:00:00").toLocaleDateString(undefined,{month:"short"})}</small>{Number(a.interview.slice(-2))}</span><span><strong>{a.company}</strong><small>{a.role}</small><small>{a.interview===localDate ? "Today" : dateLabel(a.interview)}</small></span><ChevronRight size={16}/></button>) : <div className="agenda-empty"><CalendarDays size={24}/><p>No interviews scheduled</p><small>Add an interview date to an application and it will appear here.</small></div>}</section></aside></div>
      <footer>Saved in this browser only. Clearing browser data removes your applications.</footer></div></main>
      <Dialog open={open} onOpenChange={v=>{if(!busy)setOpen(v);}}><DialogContent className="editor" showCloseButton={!busy}><DialogTitle>{editing ? "Edit application" : "Add application"}</DialogTitle><DialogDescription>Keep the details of your next opportunity together.</DialogDescription><form onSubmit={save}><label>Company<input autoFocus required maxLength={150} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="e.g. Acme"/></label><label>Role<input required maxLength={180} value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="e.g. Frontend developer"/></label><div className="form-grid"><label>Stage<select value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})}>{stages.map(s=><option key={s}>{s}</option>)}</select></label><label>Interview date <small>(optional)</small><input type="date" value={form.interview} onChange={e=>setForm({...form,interview:e.target.value})}/></label></div><label>Notes <small>(optional)</small><textarea rows={4} maxLength={5000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Contacts, interview preparation, or next steps…"/></label>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="form-actions"><button type="button" disabled={busy} onClick={()=>setOpen(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add application"}</button></div></form></DialogContent></Dialog>
      <Dialog open={!!removing} onOpenChange={v=>{if(!v&&!busy)setRemoving(null);}}><DialogContent className="editor" showCloseButton={!busy}><DialogTitle>Remove application?</DialogTitle><DialogDescription>This will permanently remove your {removing?.role} application at {removing?.company}, including its notes.</DialogDescription>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="form-actions"><button disabled={busy} onClick={()=>setRemoving(null)}>Keep application</button><button className="danger" disabled={busy} onClick={remove}>{busy ? "Removing…" : "Remove application"}</button></div></DialogContent></Dialog>
    </div>;
}
