"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

type Item={id:string;fullName:string;email:string|null;score:number;jobTitle:string;status:"TO_CONTACT"|"LINK_CREATED"|"COMPLETED";availability:string|null;dailyRate:number|null;salaryExpectation:number|null};
export default function PrequalificationQueue({items}:{items:Item[]}){
 const router=useRouter();
 const [selected,setSelected]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const selectable=useMemo(()=>items.filter(i=>i.status!=="COMPLETED").map(i=>i.id),[items]);
 const allSelected=selectable.length>0&&selectable.every(id=>selected.includes(id));
 function toggle(id:string){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);}
 async function generate(ids=selected){
  if(!ids.length)return;
  setBusy(true);setMessage("");
  const r=await fetch("/api/prequalifications/links",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidateIds:ids})});
  const j=await r.json();setBusy(false);
  if(!r.ok){setMessage(j.error||"Impossible de générer les liens");return;}
  const text=(j.links||[]).map((x:{fullName:string;url:string})=>`${x.fullName} — ${x.url}`).join("\n");
  await navigator.clipboard.writeText(text);
  setMessage(`${j.links.length} lien(s) copié(s) dans le presse-papiers.`);setSelected([]);router.refresh();
 }
 const label=(s:Item["status"])=>s==="COMPLETED"?"Complété":s==="LINK_CREATED"?"Lien généré":"À solliciter";
 return <div className="card sectionCard">
  <div className="sectionHeader"><div><h2>File de préqualification</h2><p className="muted">Sélectionnez plusieurs candidats pour générer leurs liens en une seule opération. Le statut évolue automatiquement lorsque le candidat complète son formulaire.</p></div><div className="actions"><button className="btn secondary" disabled={!selected.length||busy} onClick={()=>generate()}>{busy?"Génération…":`Générer ${selected.length||""} lien(s)`}</button></div></div>
  {message&&<p><strong>{message}</strong></p>}
  <div className="listRow"><label><input type="checkbox" checked={allSelected} onChange={()=>setSelected(allSelected?[]:selectable)}/> <strong>Sélectionner tous les dossiers à compléter</strong></label><span>{selectable.length}</span></div>
  {items.map(i=><div className="reviewQueueRow" key={i.id}>
   <div style={{width:34}}>{i.status!=="COMPLETED"&&<input type="checkbox" checked={selected.includes(i.id)} onChange={()=>toggle(i.id)}/>}</div>
   <div className="reviewQueueMain"><Link href={`/candidates/${i.id}`}><strong>{i.fullName}</strong></Link><span>{i.jobTitle} · meilleur score {i.score}/100</span><small>{i.email||"E-mail non détecté"}</small></div>
   <div className="reviewQueueMeta"><span className={i.status==="COMPLETED"?"reviewBadge success":i.status==="LINK_CREATED"?"reviewBadge warning":"reviewBadge"}>{label(i.status)}</span></div>
   <div className="reviewQueueMain"><small>Disponibilité : {i.availability||"—"}</small><small>TJM : {i.dailyRate!=null?`${i.dailyRate} €` : "—"}</small><small>Salaire : {i.salaryExpectation!=null?`${i.salaryExpectation.toLocaleString("fr-FR")} €` : "—"}</small></div>
   <div className="reviewQueueAction">{i.status!=="COMPLETED"&&<button className="btn secondary" disabled={busy} onClick={()=>generate([i.id])}>Copier le lien</button>}</div>
  </div>)}
 </div>;
}