import Link from "next/link";
import { prisma } from "../lib/db";
import { requireUser } from "../lib/auth";
import { experienceLabel, npsBucket } from "../lib/candidateExperience";

export const dynamic="force-dynamic";

function avg(values:number[]){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0}
function pct(n:number,d:number){return d?Math.round(n/d*100):0}

export default async function ExperienceObservatory(){
 const user=await requireUser();
 const surveys=await prisma.candidateSurvey.findMany({where:{organizationId:user.organizationId},include:{response:true,match:{include:{candidate:true,job:true}}},orderBy:{createdAt:"desc"}});
 const responses=surveys.filter(s=>s.response).map(s=>({survey:s,response:s.response!}));
 const clarity=avg(responses.map(x=>x.response.clarity)),responsiveness=avg(responses.map(x=>x.response.responsiveness)),respect=avg(responses.map(x=>x.response.respect)),transparency=avg(responses.map(x=>x.response.transparency));
 const experience=avg([clarity,responsiveness,respect,transparency].filter(Boolean));
 const promoters=responses.filter(x=>npsBucket(x.response.recommendation)==="PROMOTER").length,detractors=responses.filter(x=>npsBucket(x.response.recommendation)==="DETRACTOR").length;
 const nps=responses.length?Math.round((promoters-detractors)/responses.length*100):0;
 const viewed=surveys.filter(s=>s.viewCount>0).length,answered=responses.length;
 const low=responses.filter(x=>Math.min(x.response.clarity,x.response.responsiveness,x.response.respect,x.response.transparency)<=2);
 const stages=Array.from(new Set(surveys.map(s=>s.step))).map(step=>({step,total:surveys.filter(s=>s.step===step).length,answered:responses.filter(x=>x.survey.step===step).length}));
 return <>
  <div className="hero"><div><div className="eyebrow">MODULE 04 · V2.3</div><h1>Observatoire de l'expérience candidat</h1><p className="muted">Mesurer la qualité du parcours indépendamment du score de matching : clarté, réactivité, respect, transparence et recommandation.</p></div><div className="actions"><Link className="btn secondary" href="/actions">Centre d'actions</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>
  <div className="grid"><div className="card"><div className="muted">Questionnaires créés</div><div className="score">{surveys.length}</div></div><div className="card"><div className="muted">Réponses reçues</div><div className="score">{answered}</div></div><div className="card"><div className="muted">Taux de réponse</div><div className="score">{pct(answered,surveys.length)}%</div></div><div className="card"><div className="muted">NPS candidat</div><div className="score">{responses.length?nps:"—"}</div></div></div>
  <div className="grid" style={{marginTop:16}}><div className="card"><div className="muted">Clarté</div><div className="score">{responses.length?clarity.toFixed(1):"—"}/5</div></div><div className="card"><div className="muted">Réactivité</div><div className="score">{responses.length?responsiveness.toFixed(1):"—"}/5</div></div><div className="card"><div className="muted">Respect</div><div className="score">{responses.length?respect.toFixed(1):"—"}/5</div></div><div className="card"><div className="muted">Transparence</div><div className="score">{responses.length?transparency.toFixed(1):"—"}/5</div></div></div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Synthèse</h2><p className="muted">{responses.length?`${experienceLabel(experience)} · moyenne globale ${experience.toFixed(1)}/5`:"Les indicateurs apparaîtront dès la première réponse candidat."}</p></div></div>{responses.length>0&&<div className="criteriaGrid"><div><strong>Questionnaires consultés</strong><p>{viewed}/{surveys.length}</p></div><div><strong>Signaux faibles</strong><p>{low.length} réponse(s) avec une note ≤ 2</p></div><div><strong>Promoteurs / Détracteurs</strong><p>{promoters} / {detractors}</p></div></div>}</div>
  <div className="grid" style={{marginTop:16}}><div className="card"><h2>Réponses par étape</h2>{stages.length===0?<p className="muted">Aucun questionnaire créé.</p>:stages.map(s=><div className="listRow" key={s.step}><strong>{s.step}</strong><span className="muted">{s.answered}/{s.total} réponse(s)</span></div>)}</div><div className="card"><h2>Points d'attention</h2>{low.length===0?<p className="muted">Aucun signal faible détecté dans les réponses reçues.</p>:low.slice(0,8).map(x=><div className="listRow" key={x.survey.id}><div><strong>{x.survey.match.job.title}</strong><div className="muted small">Étape {x.survey.step} · note la plus basse {Math.min(x.response.clarity,x.response.responsiveness,x.response.respect,x.response.transparency)}/5</div></div><Link href={`/candidates/${x.survey.match.candidate.id}`}>Voir →</Link></div>)}</div></div>
  <div className="card" style={{marginTop:16}}><h2>Verbatims récents</h2>{responses.filter(x=>x.response.comment).length===0?<p className="muted">Aucun commentaire candidat pour le moment.</p>:responses.filter(x=>x.response.comment).slice(0,12).map(x=><div className="matchRow" key={x.survey.id}><div className="sectionHeader"><div><strong>{x.survey.match.job.title}</strong><div className="muted small">{x.survey.step} · recommandation {x.response.recommendation}/10</div></div></div><p>“{x.response.comment}”</p></div>)}</div>
 </>;
}
