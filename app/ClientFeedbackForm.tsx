"use client";

import { useState } from "react";

const OPTIONS=[
 {value:"INTERESTED",label:"Intéressé"},
 {value:"INTERVIEW",label:"Souhaite un entretien"},
 {value:"HOLD",label:"À garder en attente"},
 {value:"REJECTED",label:"Ne pas poursuivre"}
];

export default function ClientFeedbackForm({token,matchId}:{token:string;matchId:string}){
 const [name,setName]=useState(""); const [decision,setDecision]=useState("INTERESTED"); const [comment,setComment]=useState(""); const [sent,setSent]=useState(false); const [saving,setSaving]=useState(false);
 async function submit(){setSaving(true);const res=await fetch(`/api/public/share/${token}/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({matchId,clientName:name,decision,comment})});setSaving(false);if(!res.ok)return alert("Le retour n'a pas pu être enregistré.");setSent(true);}
 if(sent)return <div className="successText">Retour enregistré. Merci.</div>;
 return <div className="clientFeedback"><div className="field"><label>Votre nom (facultatif)<input value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom / société"/></label></div><div className="field"><label>Votre avis<select value={decision} onChange={e=>setDecision(e.target.value)}>{OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label></div><div className="field"><label>Commentaire<textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Points forts, questions, réserves…"/></label></div><button className="btn" onClick={submit} disabled={saving}>{saving?"Envoi…":"Envoyer mon retour"}</button></div>;
}
