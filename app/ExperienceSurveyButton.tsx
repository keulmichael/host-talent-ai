"use client";

import { useState } from "react";

export default function ExperienceSurveyButton({matchId,stage}:{matchId:string;stage:string}){
 const[loading,setLoading]=useState(false),[url,setUrl]=useState("");
 async function create(){setLoading(true);const res=await fetch(`/api/matches/${matchId}/experience`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({step:stage,days:14})});setLoading(false);const data=await res.json().catch(()=>({}));if(!res.ok)return alert(data.error||"Impossible de créer le questionnaire");const absolute=`${window.location.origin}${data.url}`;setUrl(absolute);await navigator.clipboard.writeText(absolute).catch(()=>undefined)}
 async function copy(){if(url)await navigator.clipboard.writeText(url)}
 return <div className="actions"><button className="btn secondary" onClick={create} disabled={loading}>{loading?"Création…":"Demander un retour candidat"}</button>{url&&<><button className="btn secondary" onClick={copy}>Copier le lien</button><span className="successText">Lien créé · valable 14 jours</span></>}</div>;
}
