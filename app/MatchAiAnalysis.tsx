"use client";
import { useState } from "react";

type Criterion={criterion:string;importance:"must"|"should"|"optional";status:"explicit"|"probable"|"unconfirmed"|"contradicted";confidence:number|null;evidence:string};
type Analysis={summary:string;fitSignals:string[];watchPoints:string[];criteria:Criterion[];interviewQuestions:string[];recruiterConclusion:string};

function statusLabel(status:Criterion["status"]){return status==="explicit"?"Preuve explicite":status==="probable"?"Correspondance probable":status==="contradicted"?"Contradiction / limite explicite":"Non confirmé";}
function importanceLabel(v:Criterion["importance"]){return v==="must"?"Indispensable":v==="should"?"Souhaitable":"Optionnel";}
function confidenceLabel(n:number|null){return typeof n==="number"&&Number.isFinite(n)?` · confiance ${Math.round(Math.max(0,Math.min(1,n))*100)} %`:"";}

export default function MatchAiAnalysis({matchId,deterministicScore}:{matchId:string;deterministicScore:number}){
 const[analysis,setAnalysis]=useState<Analysis|null>(null);const[loading,setLoading]=useState(false);const[error,setError]=useState("");
 async function run(){try{setLoading(true);setError("");const r=await fetch(`/api/matches/${matchId}/ai-analysis`,{method:"POST"});const j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||"Analyse IA indisponible.");return;}const a=j.analysis||{};setAnalysis({summary:String(a.summary||""),fitSignals:Array.isArray(a.fitSignals)?a.fitSignals.map(String):[],watchPoints:Array.isArray(a.watchPoints)?a.watchPoints.map(String):[],criteria:Array.isArray(a.criteria)?a.criteria.filter(Boolean).map((x:any)=>({criterion:String(x.criterion||"Critère"),importance:["must","should","optional"].includes(x.importance)?x.importance:"optional",status:["explicit","probable","unconfirmed","contradicted"].includes(x.status)?x.status:"unconfirmed",confidence:typeof x.confidence==="number"&&Number.isFinite(x.confidence)?x.confidence:null,evidence:String(x.evidence||"")})):[],interviewQuestions:Array.isArray(a.interviewQuestions)?a.interviewQuestions.map(String):[],recruiterConclusion:String(a.recruiterConclusion||"")});}catch(e){setError(e instanceof Error?e.message:"Analyse IA indisponible.");}finally{setLoading(false);}}
 return <div className="opsPanel" style={{marginTop:14}}>
  <div className="sectionHeader"><div><div className="eyebrow">IA · ADÉQUATION À LA MISSION</div><strong>Lecture sémantique du matching</strong><p className="muted small">Le score déterministe reste la référence : {deterministicScore}/100. L’IA apporte une seconde lecture des preuves et des zones d’incertitude.</p></div><button type="button" className="btn secondary" onClick={run} disabled={loading}>{loading?"Analyse…":analysis?"Relancer l’analyse":"Analyser avec l’IA"}</button></div>
  {error&&<p className="errorText">{error}</p>}
  {analysis&&<div>
   <p><strong>Synthèse :</strong> {analysis.summary||"Analyse disponible."}</p>
   <div className="criteriaGrid" style={{marginTop:12}}><div><strong>Signaux favorables</strong>{analysis.fitSignals.length?<ul>{analysis.fitSignals.slice(0,5).map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="muted">Aucun signal ajouté.</p>}</div><div><strong>Points de vigilance</strong>{analysis.watchPoints.length?<ul>{analysis.watchPoints.slice(0,5).map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="muted">Aucun point critique ajouté.</p>}</div></div>
   {analysis.criteria.length>0&&<details className="opsDetails" style={{marginTop:12}}><summary>Voir les critères et les preuves · {analysis.criteria.length}</summary>{analysis.criteria.map((x,i)=><div className="listRow" key={`${x.criterion}-${i}`}><div><strong>{x.criterion}</strong><div className="muted small">{importanceLabel(x.importance)} · {statusLabel(x.status)}{confidenceLabel(x.confidence)}</div>{x.evidence&&<div className="small">{x.evidence}</div>}</div></div>)}</details>}
   {analysis.interviewQuestions.length>0&&<details className="opsDetails" style={{marginTop:12}}><summary>Questions d’entretien suggérées · {analysis.interviewQuestions.length}</summary><ul>{analysis.interviewQuestions.slice(0,6).map((x,i)=><li key={i}>{x}</li>)}</ul></details>}
   {analysis.recruiterConclusion&&<p className="muted small" style={{marginTop:12}}><strong>Aide à la revue :</strong> {analysis.recruiterConclusion}</p>}
  </div>}
 </div>;
}
