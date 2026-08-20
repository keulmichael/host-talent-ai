"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecomputeAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/recompute", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage(`${data.matches} matching(s) recalculé(s)`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur de recalcul");
    } finally {
      setLoading(false);
    }
  }

  return <div><button className="btn secondary" onClick={run} disabled={loading}>{loading ? "Recalcul en cours…" : "Recalculer tous les matchings"}</button>{message && <div className="muted small" style={{marginTop:8}}>{message}</div>}</div>;
}
