"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading,setDemoLoading]=useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Connexion impossible"); setLoading(false); return; }
      router.replace("/");
    } catch {
      setError("Connexion impossible");
      setLoading(false);
    }
  }

  async function startDemo(){
    setDemoLoading(true);setError("");
    try{
      const res=await fetch("/api/auth/demo",{method:"POST"});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){setError(data.error||"Impossible de démarrer la démonstration.");setDemoLoading(false);return;}
      router.replace("/demo");
    }catch{
      setError("Impossible de démarrer la démonstration.");
      setDemoLoading(false);
    }
  }

  return <div className="loginWrap"><div className="card loginCard"><div className="eyebrow">HOST TALENT AI · V2.8</div><h1>Connexion cabinet</h1><p className="muted">Accédez à votre espace ou découvrez Host Talent AI dans un environnement de démonstration isolé.</p><form onSubmit={submit}><div className="field"><label>E-mail<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus autoComplete="email" required /></label></div><div className="field"><label>Mot de passe<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required /></label></div>{error && <p className="errorText">{error}</p>}<button className="btn" disabled={loading||demoLoading}>{loading ? "Connexion…" : "Se connecter"}</button></form><div style={{margin:"24px 0",borderTop:"1px solid var(--border)",paddingTop:24}}><button className="btn secondary" style={{width:"100%"}} onClick={startDemo} disabled={demoLoading||loading}>{demoLoading?"Préparation de la démo…":"Découvrir Host Talent AI en 5 minutes"}</button><p className="muted small" style={{marginTop:10}}>Aucun identifiant requis. Vous serez guidé pas à pas dans un espace temporaire contenant uniquement des missions et candidats fictifs.</p></div><p className="muted small" style={{marginTop:18}}>Première installation ? <Link href="/setup">Créer le compte administrateur</Link></p></div></div>;
}
