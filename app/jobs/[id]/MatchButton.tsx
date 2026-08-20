"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchButton({jobId}:{jobId:string}){
 const router=useRouter();const[loading,setLoading]=useState(false);const[msg,setMsg]=useState("");
 async function run(){setLoading(true);setMsg("");try{const res=await fetch("/api/match",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Erreur");setMsg(`${data.count} profil(s) analysé(s)`);router.refresh()}catch(e){setMsg(e instanceof Error?e.message:"Erreur")}finally{setLoading(false)}}
 return <div><button className="btn" onClick={run} disabled={loading}>{loading?"Analyse du vivier…":"Analyser / actualiser le vivier"}</button>{msg&&<div className="muted small" style={{marginTop:8}}>{msg}</div>}</div>;
}
