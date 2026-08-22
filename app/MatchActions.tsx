"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES } from "./lib/pipeline";

export default function MatchActions({ id, stage, recruiterNote, nextAction, candidateInterest }: { id:string; stage:string; recruiterNote:string|null; nextAction:string|null; candidateInterest?:string|null }) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(stage);
  const [note, setNote] = useState(recruiterNote || "");
  const [action, setAction] = useState(nextAction || "");
  const [interest, setInterest] = useState(candidateInterest || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true); setSaved(false);
    const res = await fetch(`/api/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: currentStage, recruiterNote: note, nextAction: action, candidateInterest: interest })
    });
    setSaving(false);
    if (!res.ok) return alert("Impossible d'enregistrer le suivi");
    setSaved(true); router.refresh();
  }

  return <div className="opsPanel">
    <div className="criteriaGrid"><div className="field"><label>Étape du pipeline<select value={currentStage} onChange={(e)=>setCurrentStage(e.target.value)}>{PIPELINE_STAGES.map((s)=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label></div><div className="field"><label>Intérêt candidat<select value={interest} onChange={e=>setInterest(e.target.value)}><option value="">À confirmer</option><option value="INTERESTED">Intéressé(e)</option><option value="TO_CONFIRM">À revalider</option><option value="NOT_INTERESTED">Non intéressé(e)</option></select></label></div></div>
    <div className="field"><label>Prochaine action<input value={action} onChange={(e)=>setAction(e.target.value)} placeholder="Ex. Appeler mardi matin" /></label></div>
    <div className="field"><label>Note recruteur<textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Observation interne, éléments à confirmer…" /></label></div>
    <div className="actions"><button className="btn secondary" onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer le suivi"}</button>{saved && <span className="successText">Enregistré</span>}</div>
  </div>;
}
