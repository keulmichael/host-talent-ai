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
      let cursor=0;
      let done=false;
      let total=0;
      let jobs=0;
      let candidates=0;
      let guard=0;
      while(!done){
        const res=await fetch("/api/recompute/batch",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({cursor,batchSize:120})
        });
        const data=await res.json();
        if(!res.ok)throw new Error(data.error||"Erreur de recalcul");
        cursor=data.cursor;
        total=data.total;
        jobs=data.jobs;
        candidates=data.candidates;
        done=data.done;
        setMessage(`${data.percent}% · ${cursor}/${total} matching(s)`);
        guard++;
        if(guard>200)throw new Error("Recalcul interrompu par sécurité");
      }
      setMessage(`Terminé · ${total} matching(s) · ${jobs} mission(s) × ${candidates} candidat(s)`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur de recalcul");
    } finally {
      setLoading(false);
    }
  }

  return <div><button className="btn secondary" onClick={run} disabled={loading}>{loading ? "Recalcul massif en cours…" : "Recalculer tous les matchings"}</button>{message && <div className="muted small" style={{marginTop:8}}>{message}</div>}</div>;
}
