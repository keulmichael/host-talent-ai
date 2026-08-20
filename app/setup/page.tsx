"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage(){
 const router=useRouter();
 const [form,setForm]=useState({organizationName:"Host Agency",fullName:"",email:"",password:""});
 const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError("");const res=await fetch("/api/auth/setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json().catch(()=>({}));if(!res.ok){setError(data.error||"Initialisation impossible");setLoading(false);return;}router.push("/");router.refresh();}
 return <div className="loginWrap"><div className="card loginCard"><div className="eyebrow">INITIALISATION V1.6</div><h1>Créer l'administrateur</h1><p className="muted">Cette étape n'est possible qu'une seule fois. Le premier compte devient administrateur du cabinet.</p><form onSubmit={submit}><div className="field"><label>Nom du cabinet<input value={form.organizationName} onChange={e=>setForm({...form,organizationName:e.target.value})} required/></label></div><div className="field"><label>Nom complet<input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required/></label></div><div className="field"><label>E-mail<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label></div><div className="field"><label>Mot de passe<input type="password" minLength={10} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><span className="muted small">10 caractères minimum.</span></label></div>{error&&<p className="errorText">{error}</p>}<button className="btn" disabled={loading}>{loading?"Création…":"Créer l'espace sécurisé"}</button></form></div></div>;
}
