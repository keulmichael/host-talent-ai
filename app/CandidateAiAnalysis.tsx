"use client";
import { useState } from "react";

type EvidenceItem={label:string;status:"explicit"|"probable"|"unconfirmed"|"contradicted";confidence?:number|null;evidence:string};
type Analysis={summary:string;currentRole:string|null;seniority:string|null;sectors:string[];skills:EvidenceItem[];management:EvidenceItem|null;languages:EvidenceItem[];strengths:string[];uncertainties:string[]};

function statusLabel(status:EvidenceItem["status"]){
  return status==="explicit"?"Preuve explicite":status==="probable"?"Correspondance probable":status==="contradicted"?"Mention limitée / contradictoire":"Non confirmé";
}
function confidenceLabel(n?:number|null){
  return typeof n==="number"&&Number.isFinite(n)?` · confiance ${Math.round(Math.max(0,Math.min(1,n))*100)} %`:"";
}
function Evidence({item}:{item:EvidenceItem}){
  return <div className="listRow"><div><strong>{item.label}</strong><div className="muted small">{statusLabel(item.status)}{confidenceLabel(item.confidence)}</div>{item.evidence&&<div className="small">{item.evidence}</div>}</div></div>;
}

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

  const keySkills=analysis?.skills?.slice(0,8)||[];
  const extraSkills=analysis?.skills?.slice(8)||[];

  return <section className="card sectionCard" style={{marginTop:16}}>
    <div className="sectionHeader"><div><div className="eyebrow">IA GÉNÉRATIVE · ANALYSE ASSISTÉE</div><h2>Lecture approfondie du CV</h2><p className="muted">Comprendre le profil en quelques secondes, puis ouvrir les preuves uniquement si nécessaire. L’IA complète l’analyse structurée sans modifier le score ni prendre de décision de recrutement.</p></div><button className="btn" onClick={run} disabled={loading}>{loading?"Analyse en cours…":analysis?"Relancer l’analyse IA":"Analyser ce CV avec l’IA"}</button></div>
    {error&&<p className="errorText">{error}</p>}
    {!analysis&&!error&&<p className="muted">L’analyse n’est lancée qu’à la demande afin de conserver le contrôle sur l’usage de l’IA et les coûts d’API.</p>}
    {analysis&&<div>
      <div className="opsPanel"><div className="eyebrow">LECTURE EN 20 SECONDES</div><strong>Synthèse IA</strong><p>{analysis.summary}</p></div>
      <div className="criteriaGrid" style={{marginTop:16}}><div><strong>Rôle actuel / récent</strong><p>{analysis.currentRole||"Non confirmé"}</p></div><div><strong>Niveau de séniorité</strong><p>{analysis.seniority||"Non confirmé"}</p></div><div><strong>Secteurs détectés</strong><p>{analysis.sectors?.length?analysis.sectors.join(", "):"Non confirmé"}</p></div></div>

      {analysis.strengths?.length>0&&<div style={{marginTop:18}}><h3>Forces clés</h3><ul>{analysis.strengths.slice(0,6).map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul></div>}

      {analysis.uncertainties?.length>0&&<div className="opsPanel" style={{marginTop:18}}><div className="eyebrow">REVUE HUMAINE</div><h3 style={{marginTop:4}}>À confirmer par le recruteur</h3><ul>{analysis.uncertainties.slice(0,6).map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul></div>}

      {keySkills.length>0&&<><h3 style={{marginTop:22}}>Compétences structurantes</h3><p className="muted small">Les principales compétences détectées et leur niveau de preuve.</p><div>{keySkills.map((x,i)=><Evidence item={x} key={`${x.label}-${i}`}/>)}</div></>}

      {(extraSkills.length>0||analysis.management||analysis.languages?.length>0)&&<details className="opsDetails" style={{marginTop:18}}><summary>Voir toute l’analyse et les preuves{extraSkills.length?` · ${analysis.skills.length} compétences`:""}</summary>
        {extraSkills.length>0&&<><h3>Autres compétences et preuves</h3><div>{extraSkills.map((x,i)=><Evidence item={x} key={`${x.label}-${i}`}/>)}</div></>}
        {analysis.management&&<><h3>Management</h3><Evidence item={analysis.management}/></>}
        {analysis.languages?.length>0&&<><h3>Langues</h3><div>{analysis.languages.map((x,i)=><span className="pill" key={`${x.label}-${i}`}>{x.label} · {statusLabel(x.status)}{confidenceLabel(x.confidence)}</span>)}</div></>}
      </details>}

      <div className="opsPanel" style={{marginTop:18}}><div className="eyebrow">PROCHAINE COUCHE</div><strong>Adéquation IA à une mission</strong><p className="muted">La lecture du CV établit qui est le candidat. L’analyse mission par mission pourra ensuite confronter ces preuves aux indispensables et souhaitables du besoin client, sans remplacer le score déterministe.</p></div>
      <p className="muted small" style={{marginTop:18}}>Analyse générative indicative : les preuves du CV et la décision humaine restent prioritaires. Cette analyse ne modifie pas le score de matching déterministe.</p>
    </div>}
  </section>;
}
