"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { messageTemplate, recommendedAction, RelationshipInput } from "./lib/relationship";

type Activity={id:string;type:string;channel:string;status:string;priority:string;subject:string|null;body:string|null;dueAt:string|null;completedAt:string|null;createdAt:string};
type CustomTemplate={subject:string;body:string};
type Props={matchId:string;candidateId:string;input:RelationshipInput;activities:Activity[];templates?:Record<string,CustomTemplate>;recruiterName?:string};

const typeLabels:Record<string,string>={RECEIPT:"Accusé de réception",CONTACT:"Prise de contact",FOLLOW_UP:"Relance / suivi",INTERVIEW:"Proposition d'entretien",POST_INTERVIEW:"Suivi post-entretien",NOTE:"Note interne"};
function renderCustom(t:CustomTemplate|undefined,input:RelationshipInput,recruiterName:string){
 if(!t)return null;
 const first=input.candidateName.trim().split(/\s+/)[0]||input.candidateName;
 const vars:Record<string,string>={candidate:first,mission:input.jobTitle,client:input.clientName||"",recruiter:recruiterName||"Le consultant"};
 const fill=(s:string)=>s.replace(/{{\s*(candidate|mission|client|recruiter)\s*}}/gi,(_,k)=>vars[String(k).toLowerCase()]||"");
 return{subject:fill(t.subject),body:fill(t.body)};
}

export default function RelationshipPanel({matchId,candidateId,input,activities,templates={},recruiterName=""}:Props){
 const router=useRouter();
 const recommendation=useMemo(()=>recommendedAction(input),[input]);
 const[type,setType]=useState(recommendation.type);
 const[channel,setChannel]=useState(recommendation.channel);
 const[priority,setPriority]=useState(recommendation.priority);
 const[dueAt,setDueAt]=useState("");
 const initialTemplate=useMemo(()=>renderCustom(templates[recommendation.type],input,recruiterName)||messageTemplate(recommendation.type,input),[templates,recommendation.type,input,recruiterName]);
 const[subject,setSubject]=useState(initialTemplate.subject);
 const[body,setBody]=useState(initialTemplate.body);
 const[saving,setSaving]=useState(false);const[dispatching,setDispatching]=useState("");
 function changeType(v:string){setType(v);const t=renderCustom(templates[v],input,recruiterName)||messageTemplate(v,input);setSubject(t.subject);setBody(t.body);setChannel(v==="INTERVIEW"?"MEETING":v==="NOTE"?"OTHER":"EMAIL")}
 async function createActivity(){setSaving(true);const res=await fetch("/api/activities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidateId,matchId,type,channel,priority,status:"PLANNED",subject,body,dueAt:dueAt||null})});setSaving(false);if(!res.ok){const d=await res.json().catch(()=>({}));return alert(d.error||"Impossible d'enregistrer l'action")}router.refresh()}
 async function mark(id:string,status:string){const res=await fetch(`/api/activities/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});if(!res.ok)return alert("Mise à jour impossible");router.refresh()}
 async function dispatch(id:string){setDispatching(id);const res=await fetch(`/api/activities/${id}/dispatch`,{method:"POST"});const d=await res.json().catch(()=>({}));setDispatching("");if(!res.ok)return alert(d.error||"Transmission impossible");alert("Action transmise au(x) connecteur(s) actif(s). Aucun envoi externe n'est déclenché sans cette validation.");router.refresh()}
 async function copy(){await navigator.clipboard.writeText(`${subject}\n\n${body}`)}
 return <div className="opsPanel">
  <div className="decisionSummary"><strong>Prochaine action recommandée : {recommendation.label}</strong><span>{recommendation.reason}</span></div>
  <p className="muted small">Aucun message n'est envoyé automatiquement : Host Talent AI prépare l'action, le recruteur la valide puis l'exécute. Les modèles du cabinet sont utilisés lorsqu'ils sont configurés.</p>
  <div className="criteriaGrid"><div><label>Type d'action<select value={type} onChange={e=>changeType(e.target.value)}>{Object.entries(typeLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label></div><div><label>Canal<select value={channel} onChange={e=>setChannel(e.target.value)}><option value="EMAIL">E-mail</option><option value="PHONE">Téléphone</option><option value="MEETING">Entretien / RDV</option><option value="OTHER">Autre</option></select></label></div><div><label>Priorité<select value={priority} onChange={e=>setPriority(e.target.value as "HIGH"|"NORMAL"|"LOW")}><option value="HIGH">Haute</option><option value="NORMAL">Normale</option><option value="LOW">Basse</option></select></label></div></div>
  <div className="field"><label>Échéance<input type="datetime-local" value={dueAt} onChange={e=>setDueAt(e.target.value)}/></label></div>
  <div className="field"><label>Objet<input value={subject} onChange={e=>setSubject(e.target.value)}/></label></div>
  <div className="field"><label>Message préparé<textarea value={body} onChange={e=>setBody(e.target.value)} rows={8}/></label></div>
  <div className="actions"><button className="btn secondary" onClick={copy}>Copier le message</button><button className="btn" onClick={createActivity} disabled={saving}>{saving?"Enregistrement…":"Planifier l'action"}</button></div>
  <div style={{marginTop:18}}><strong>Historique relationnel</strong>{activities.length===0?<p className="muted small">Aucune interaction enregistrée pour cette mission.</p>:activities.map(a=><div className="listRow" key={a.id}><div><strong>{typeLabels[a.type]||a.type}</strong><div className="muted small">{a.channel} · {a.status}{a.dueAt?` · échéance ${new Date(a.dueAt).toLocaleString("fr-FR")}`:""}</div>{a.subject&&<div className="small">{a.subject}</div>}</div><div className="actions">{a.status==="PLANNED"&&<>{a.type!=="NOTE"&&<button className="btn secondary" disabled={dispatching===a.id} onClick={()=>dispatch(a.id)}>{dispatching===a.id?"Transmission…":"Transmettre"}</button>}<button className="btn secondary" onClick={()=>mark(a.id,"DONE")}>Marquer faite</button><button className="btn secondary" onClick={()=>mark(a.id,"CANCELLED")}>Annuler</button></>}</div></div>)}</div>
 </div>;
}
