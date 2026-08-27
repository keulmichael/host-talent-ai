"use client";
import { useState } from "react";

type EvidenceItem={label:string;status:"explicit"|"probable"|"unconfirmed"|"contradicted";confidence:number;evidence:string};
type Analysis={summary:string;currentRole:string|null;seniority:string|null;sectors:string[];skills:EvidenceItem[];management:EvidenceItem|null;languages:EvidenceItem[];strengths:string[];uncertainties:string[]};

function statusLabel(status:EvidenceItem["status"]){
  return status==="explicit"?"Preuve explicite":status==="probable"?"Correspondance probable":status==="contradicted"?"Mention limitée / contradictoire":"Non confirmé";
}
function pct(n:number){return `${Math.round(Math.max(0,Math.min(1,n))*100)} %`;}

export default function CandidateAiAnalysis({candidateId}:{candidateId:string}){
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function run(){
    setLoading(true);setError("");
    const r=await fetch(`/api/candidates/${candidateId}/ai-analysis`,{method:"POST"});
    const j=await r.json().catch(()=>({}));
    setLoading(false);
    if(!r.ok){setError(j.error||"Analyse IA indisponible.");return;}
    setAnalysis(j.analysis);
  }

  return <section className="card sectionCard" style={{marginTop:16}}>
    <div className="sectionHeader"><div><div className="eyebrow">IA GÉNÉRATIVE · ANALYSE ASSISTÉE</div><h2>Lecture approfondie du CV</h2><p className="muted">Cette couche complète l’analyse structurée existante. Elle cherche des preuves explicites et des correspondances sémantiques, sans modifier le score ni prendre de décision de recrutement.</p></div><button className="btn" onClick={run} disabled={loading}>{loading?"Analyse en cours…":analysis?"Relancer l’analyse IA":"Analyser ce CV avec l’IA"}</button></div>
    {error&&<p className="errorText">{error}</p>}
    {!analysis&&!error&&<p className="muted">L’analyse n’est lancée qu’à la demande afin de conserver le contrôle sur l’usage de l’IA et les coûts d’API.</p>}
    {analysis&&<div>
      <div className="opsPanel"><strong>Synthèse IA</strong><p>{analysis.summary}</p></div>
      <div className="criteriaGrid" style={{marginTop:16}}><div><strong>Rôle actuel / récent</strong><p>{analysis.currentRole||"Non confirmé"}</p></div><div><strong>Niveau de séniorité</strong><p>{analysis.seniority||"Non confirmé"}</p></div><div><strong>Secteurs détectés</strong><p>{analysis.sectors?.length?analysis.sectors.join(", "):"Non confirmé"}</p></div></div>
      {analysis.strengths?.length>0&&<><h3>Forces observées</h3><ul>{analysis.strengths.map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul></>}
      {analysis.skills?.length>0&&<><h3>Compétences et preuves</h3><div>{analysis.skills.map((x,i)=><div className="listRow" key={`${x.label}-${i}`}><div><strong>{x.label}</strong><div className="muted small">{statusLabel(x.status)} · confiance {pct(x.confidence)}</div><div className="small">{x.evidence||"Aucune preuve courte fournie"}</div></div></div>)}</div></>}
      {analysis.management&&<><h3>Management</h3><div className="listRow"><div><strong>{analysis.management.label}</strong><div className="muted small">{statusLabel(analysis.management.status)} · confiance {pct(analysis.management.confidence)}</div><div className="small">{analysis.management.evidence}</div></div></div></>}
      {analysis.languages?.length>0&&<><h3>Langues</h3><div>{analysis.languages.map((x,i)=><span className="pill" key={`${x.label}-${i}`}>{x.label} · {statusLabel(x.status)}</span>)}</div></>}
      {analysis.uncertainties?.length>0&&<><h3>À confirmer par le recruteur</h3><ul>{analysis.uncertainties.map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul></>}
      <p className="muted small" style={{marginTop:18}}>Analyse générative indicative : les preuves du CV et la décision humaine restent prioritaires. Cette analyse ne modifie pas le score de matching déterministe.</p>
    </div>}
  </section>;
}
