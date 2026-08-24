"use client";
import {useState} from "react";

export default function CommercialPrequalButton({candidateId,eligible=true}:{candidateId:string;eligible?:boolean}){
 const [copied,setCopied]=useState(false);
 const [error,setError]=useState("");
 async function copy(){
  if(!eligible)return;
  setError("");
  const r=await fetch(`/api/candidates/${candidateId}/prequalification-link`,{method:"POST"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){setError(j.error||"Impossible de créer le lien");return;}
  try{await navigator.clipboard.writeText(j.url);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setError("Lien généré, mais la copie automatique a échoué.");}
 }
 if(!eligible)return <div><button className="btn secondary" disabled title="Disponible après sélection du candidat">Préqualification disponible après sélection</button><p className="muted small" style={{marginTop:8}}>Placez d’abord le candidat en Short-list, Contacté ou Entretien sur une mission.</p></div>;
 return <div><button className="btn secondary" onClick={copy}>{copied?"Lien copié ✓":"Copier le lien disponibilité & rémunération"}</button>{error&&<p className="warningText small" style={{marginTop:8}}>{error}</p>}</div>;
}