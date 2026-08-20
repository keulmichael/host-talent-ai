"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetentionSettings({current}:{current:number}){
 const router=useRouter(); const[value,setValue]=useState(current); const[saving,setSaving]=useState(false); const[msg,setMsg]=useState("");
 async function save(){setSaving(true);setMsg("");const res=await fetch("/api/admin/privacy",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({retentionMonths:value})});const data=await res.json().catch(()=>({}));setSaving(false);if(res.ok){setMsg("Politique enregistrée.");router.refresh();}else setMsg(data.error||"Enregistrement impossible");}
 return <div className="opsPanel"><div className="field"><label>Durée par défaut pour les nouveaux profils<select value={value} onChange={(e)=>setValue(Number(e.target.value))}><option value={6}>6 mois</option><option value={12}>12 mois</option><option value={18}>18 mois</option><option value={24}>24 mois</option><option value={36}>36 mois</option><option value={48}>48 mois</option><option value={60}>60 mois</option></select></label></div><button className="btn" onClick={save} disabled={saving}>{saving?"Enregistrement…":"Enregistrer"}</button>{msg&&<p className="muted small">{msg}</p>}</div>;
}
