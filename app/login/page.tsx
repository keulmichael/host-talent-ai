"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Connexion impossible"); setLoading(false); return; }
    router.push("/"); router.refresh();
  }

  return <div className="loginWrap"><div className="card loginCard"><div className="eyebrow">HOST TALENT AI · V1.6</div><h1>Espace cabinet</h1><p className="muted">Accès réservé aux utilisateurs autorisés.</p><form onSubmit={submit}><div className="field"><label>Code d'accès<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoFocus autoComplete="current-password" /></label></div>{error && <p className="errorText">{error}</p>}<button className="btn" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button></form></div></div>;
}
