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

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Connexion impossible"); setLoading(false); return; }
    router.push("/"); router.refresh();
  }

  return <div className="loginWrap"><div className="card loginCard"><div className="eyebrow">HOST TALENT AI · V1.6</div><h1>Connexion cabinet</h1><p className="muted">Accès réservé aux utilisateurs autorisés.</p><form onSubmit={submit}><div className="field"><label>E-mail<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus autoComplete="email" required /></label></div><div className="field"><label>Mot de passe<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required /></label></div>{error && <p className="errorText">{error}</p>}<button className="btn" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button></form><p className="muted small" style={{marginTop:18}}>Première installation ? <Link href="/setup">Créer le compte administrateur</Link></p></div></div>;
}
