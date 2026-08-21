"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickStageButton({ matchId, stage, label }: { matchId:string; stage:string; label:string }) {
  const router = useRouter();
  const [loading,setLoading] = useState(false);
  async function run(){
    setLoading(true);
    const res = await fetch(`/api/matches/${matchId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage})});
    setLoading(false);
    if(!res.ok) return alert("Impossible de mettre à jour le candidat");
    router.refresh();
  }
  return <button className="btn secondary" onClick={run} disabled={loading}>{loading?"Mise à jour…":label}</button>;
}
