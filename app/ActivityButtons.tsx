"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function ActivityButtons({id,canDispatch=true}:{id:string;canDispatch?:boolean}){
 const router=useRouter();const[busy,setBusy]=useState("");
 async function status(value:string){setBusy(value);const res=await fetch(`/api/activities/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:value})});setBusy("");if(!res.ok)return alert("Mise à jour impossible");router.refresh()}
 async function dispatch(){setBusy("dispatch");const res=await fetch(`/api/activities/${id}/dispatch`,{method:"POST"});const d=await res.json().catch(()=>({}));setBusy("");if(!res.ok)return alert(d.error||"Transmission impossible");alert("Action transmise au(x) connecteur(s) actif(s). Elle reste sous contrôle du recruteur.");router.refresh()}
 return <div className="actions">{canDispatch&&<button className="btn secondary" disabled={!!busy} onClick={dispatch}>{busy==="dispatch"?"Transmission…":"Transmettre au connecteur"}</button>}<button className="btn secondary" disabled={!!busy} onClick={()=>status("DONE")}>{busy==="DONE"?"Enregistrement…":"Marquer faite"}</button><button className="btn secondary" disabled={!!busy} onClick={()=>status("CANCELLED")}>Annuler</button></div>;
}
