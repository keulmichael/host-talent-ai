"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CandidateCommercial({candidateId,availability,dailyRate,salaryExpectation}:{candidateId:string;availability:string|null;dailyRate:number|null;salaryExpectation:number|null}){
 const router=useRouter();
 const [available,setAvailable]=useState(availability||"");
 const [rate,setRate]=useState(dailyRate?String(dailyRate):"");
 const [salary,setSalary]=useState(salaryExpectation?String(salaryExpectation):"");
 const [saving,setSaving]=useState(false);
 async function save(){
  setSaving(true);
  const res=await fetch(`/api/candidates/${candidateId}/commercial`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({availability:available,dailyRate:rate?Number(rate):null,salaryExpectation:salary?Number(salary):null})});
  setSaving(false);
  if(!res.ok)return alert("Impossible d'enregistrer les informations commerciales");
  router.refresh();
 }
 return <div className="opsPanel"><div className="criteriaGrid"><div><label>Disponibilité<input value={available} onChange={e=>setAvailable(e.target.value)} placeholder="Ex. Immédiate / 1 mois"/></label></div><div><label>TJM souhaité (€)<input type="number" min="0" value={rate} onChange={e=>setRate(e.target.value)} placeholder="Ex. 650"/></label></div><div><label>Prétention salariale annuelle (€)<input type="number" min="0" value={salary} onChange={e=>setSalary(e.target.value)} placeholder="Ex. 65000"/></label></div></div><button className="btn secondary" onClick={save} disabled={saving}>{saving?"Enregistrement…":"Enregistrer disponibilité / rémunération"}</button></div>;
}
