"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCandidateButton({id,name}:{id:string;name:string}){
 const router=useRouter();const[busy,setBusy]=useState(false);
 async function remove(){if(!confirm(`Supprimer définitivement ${name} et tous ses matchings ? Cette action est irréversible.`))return;setBusy(true);const r=await fetch(`/api/candidates/${id}`,{method:"DELETE"});if(!r.ok){alert("Suppression impossible.");setBusy(false);return;}router.push("/candidates");router.refresh();}
 return <button className="btn danger" onClick={remove} disabled={busy}>{busy?"Suppression…":"Supprimer les données"}</button>;
}
