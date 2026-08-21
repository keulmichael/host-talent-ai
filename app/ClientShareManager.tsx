"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

type Share={id:string;label:string|null;expiresAt:string;active:boolean;createdAt:string;lastViewedAt:string|null;viewCount:number;feedbackCount:number};

export default function ClientShareManager({jobId}:{jobId:string}){
 const router=useRouter(); const[shares,setShares]=useState<Share[]>([]); const[label,setLabel]=useState(""); const[days,setDays]=useState("14"); const[newUrl,setNewUrl]=useState(""); const[busy,setBusy]=useState(false);
 async function load(){const r=await fetch(`/api/jobs/${jobId}/shares`,{cache:"no-store"});if(r.ok)setShares(await r.json());}
 useEffect(()=>{load()},[]);
 async function create(){setBusy(true);const r=await fetch(`/api/jobs/${jobId}/shares`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label,days:Number(days)})});setBusy(false);if(!r.ok){const e=await r.json().catch(()=>({}));return alert(e.error||"Impossible de créer le lien");}const data=await r.json();setNewUrl(`${window.location.origin}${data.url}`);setLabel("");await load();router.refresh();}
 async function toggle(s:Share){await fetch(`/api/shares/${s.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!s.active})});await load();router.refresh();}
 async function copy(){if(newUrl){await navigator.clipboard.writeText(newUrl);alert("Lien copié");}}
 return <div className="opsPanel"><h3>Partager la short-list au client</h3><p className="muted small">Crée un lien privé, temporaire et révocable. Le client ne voit ni e-mail candidat, ni notes recruteur.</p><div className="criteriaGrid"><div><label>Libellé<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ex. Direction RH — 1re sélection"/></label></div><div><label>Validité<select value={days} onChange={e=>setDays(e.target.value)}><option value="3">3 jours</option><option value="7">7 jours</option><option value="14">14 jours</option><option value="30">30 jours</option></select></label></div></div><button className="btn" onClick={create} disabled={busy}>{busy?"Création…":"Créer un lien client"}</button>{newUrl&&<div className="shareUrl"><input readOnly value={newUrl}/><button className="btn secondary" onClick={copy}>Copier le lien</button></div>}<div style={{marginTop:18}}>{shares.map(s=><div className="listRow" key={s.id}><div><strong>{s.label||"Partage client"}</strong><div className="muted small">{s.active?"Actif":"Révoqué"} · expire le {new Date(s.expiresAt).toLocaleDateString("fr-FR")} · {s.viewCount} vue(s) · {s.feedbackCount} retour(s){s.lastViewedAt?` · dernière vue ${new Date(s.lastViewedAt).toLocaleString("fr-FR")}`:""}</div></div><button className="btn secondary" onClick={()=>toggle(s)}>{s.active?"Révoquer":"Réactiver"}</button></div>)}</div></div>;
}
