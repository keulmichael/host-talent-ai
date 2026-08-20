"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordForm(){
 const router=useRouter(); const[currentPassword,setCurrent]=useState(""); const[newPassword,setNext]=useState(""); const[error,setError]=useState(""); const[loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError("");const res=await fetch("/api/account/password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword,newPassword})});const data=await res.json().catch(()=>({}));if(!res.ok){setError(data.error||"Modification impossible");setLoading(false);return;}router.push("/login");router.refresh();}
 return <form onSubmit={submit}><div className="field"><label>Mot de passe actuel<input type="password" value={currentPassword} onChange={e=>setCurrent(e.target.value)} required/></label></div><div className="field"><label>Nouveau mot de passe<input type="password" minLength={10} value={newPassword} onChange={e=>setNext(e.target.value)} required/><span className="muted small">10 caractères minimum. Toutes les sessions seront fermées après modification.</span></label></div>{error&&<p className="errorText">{error}</p>}<button className="btn" disabled={loading}>{loading?"Modification…":"Changer le mot de passe"}</button></form>;
}
