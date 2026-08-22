"use client";
import {useState} from "react";

export default function CorrectiveActionButton({candidateId,matchId,subject,body,type="FOLLOW_UP",channel="EMAIL",priority="HIGH"}:{candidateId:string;matchId:string;subject:string;body:string;type?:string;channel?:string;priority?:string}){
 const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);const[error,setError]=useState("");
 async function create(){setLoading(true);setError("");const due=new Date(Date.now()+24*3600000).toISOString();const r=await fetch("/api/activities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({candidateId,matchId,type,channel,status:"PLANNED",priority,subject,body,dueAt:due})});const data=await r.json().catch(()=>({}));if(!r.ok)setError(data.error||"Création impossible");else setDone(true);setLoading(false)}
 if(done)return <span className="pill">Action planifiée</span>;
 return <span><button className="btn secondary" onClick={create} disabled={loading}>{loading?"Création…":"Créer l'action corrective"}</button>{error&&<span className="warningText small" style={{marginLeft:8}}>{error}</span>}</span>;
}
