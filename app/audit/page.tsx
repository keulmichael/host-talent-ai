import Link from "next/link";
import { prisma } from "../lib/db";
import { requireUser } from "../lib/auth";
import { auditLevelLabel, buildExperienceAudit } from "../lib/experienceAudit";

export const dynamic="force-dynamic";
function avg(values:number[]){return values.length?values.reduce((a,b)=>a+b,0)/values.length:null}
function statusClass(level:string){return level==="GOOD"?"pill":level==="RISK"?"warningText":"muted"}

export default async function CandidateExperienceAudit(){
 const user=await requireUser(); const organizationId=user.organizationId; const now=new Date();
 const org=await prisma.organization.findUnique({where:{id:organizationId},select:{candidateResponseSlaHours:true,interviewFollowupSlaHours:true,clientFeedbackSlaHours:true}});
 const [candidates,matches,activities,surveys,shares,jobs]=await Promise.all([
  prisma.candidate.findMany({where:{organizationId},select:{id:true,email:true}}),
  prisma.match.findMany({where:{organizationId},include:{candidate:true,job:true}}),
  prisma.candidateActivity.findMany({where:{organizationId},select:{id:true,matchId:true,status:true,dueAt:true,completedAt:true,createdAt:true}}),
  prisma.candidateSurvey.findMany({where:{organizationId},include:{response:true}}),
  prisma.clientShare.findMany({where:{organizationId,active:true},select:{id:true,createdAt:true,lastViewedAt:true,feedbacks:true}}),
  prisma.job.findMany({where:{organizationId},select:{id:true,title:true,clientName:true}})
 ]);
 const responses=surveys.filter(s=>s.response).map(s=>s.response!);
 const relevant=matches.filter(m=>m.score>=55);
 const active=matches.filter(m=>["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER"].includes(m.stage));
 const prequalified=relevant.filter(m=>Boolean(m.candidate.availability)&&Boolean(m.candidateInterest)&&Boolean(m.candidate.dailyRate||m.candidate.salaryExpectation));
 const planned=activities.filter(a=>a.status==="PLANNED");
 const overdue=planned.filter(a=>a.dueAt&&a.dueAt<now);
 const completed=activities.filter(a=>a.status==="DONE");
 const stagnantThreshold=new Date(now.getTime()-Math.max(org?.candidateResponseSlaHours||24,48)*3600000);
 const stagnant=active.filter(m=>m.updatedAt<stagnantThreshold&&!activities.some(a=>a.matchId===m.id&&a.status==="PLANNED"&&(!a.dueAt||a.dueAt>=now)));
 const shareThreshold=new Date(now.getTime()-(org?.clientFeedbackSlaHours||72)*3600000);
 const sharesWithoutFeedback=shares.filter(s=>s.feedbacks.length===0&&s.createdAt<shareThreshold);
 const audit=buildExperienceAudit({
  candidates:candidates.length,candidatesWithEmail:candidates.filter(c=>c.email).length,relevantMatches:relevant.length,activeMatches:active.length,prequalifiedMatches:prequalified.length,
  activities:activities.length,completedActivities:completed.length,plannedActivities:planned.length,overdueActivities:overdue.length,surveys:surveys.length,surveyResponses:responses.length,
  clarityAvg:avg(responses.map(r=>r.clarity)),responsivenessAvg:avg(responses.map(r=>r.responsiveness)),respectAvg:avg(responses.map(r=>r.respect)),transparencyAvg:avg(responses.map(r=>r.transparency)),
  clientSharesWithoutFeedback:sharesWithoutFeedback.length,stagnantMatches:stagnant.length
 });
 const missionRows=jobs.map(job=>{
  const jm=matches.filter(m=>m.jobId===job.id);const jr=jm.filter(m=>m.score>=55);const ja=activities.filter(a=>a.matchId&&jm.some(m=>m.id===a.matchId));const js=surveys.filter(s=>jm.some(m=>m.id===s.matchId));const jresp=js.filter(s=>s.response).map(s=>s.response!);const jactive=jm.filter(m=>["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER"].includes(m.stage));const jstagnant=jactive.filter(m=>m.updatedAt<stagnantThreshold&&!ja.some(a=>a.matchId===m.id&&a.status==="PLANNED"&&(!a.dueAt||a.dueAt>=now)));const jpre=jr.filter(m=>Boolean(m.candidate.availability)&&Boolean(m.candidateInterest)&&Boolean(m.candidate.dailyRate||m.candidate.salaryExpectation));
  const jaudit=buildExperienceAudit({candidates:new Set(jm.map(m=>m.candidateId)).size,candidatesWithEmail:new Set(jm.filter(m=>m.candidate.email).map(m=>m.candidateId)).size,relevantMatches:jr.length,activeMatches:jactive.length,prequalifiedMatches:jpre.length,activities:ja.length,completedActivities:ja.filter(a=>a.status==="DONE").length,plannedActivities:ja.filter(a=>a.status==="PLANNED").length,overdueActivities:ja.filter(a=>a.status==="PLANNED"&&a.dueAt&&a.dueAt<now).length,surveys:js.length,surveyResponses:jresp.length,clarityAvg:avg(jresp.map(r=>r.clarity)),responsivenessAvg:avg(jresp.map(r=>r.responsiveness)),respectAvg:avg(jresp.map(r=>r.respect)),transparencyAvg:avg(jresp.map(r=>r.transparency)),clientSharesWithoutFeedback:0,stagnantMatches:jstagnant.length});
  return{job,audit:jaudit,active:jactive.length,relevant:jr.length};
 }).sort((a,b)=>(a.audit.score??101)-(b.audit.score??101));
 return <>
  <div className="hero"><div><div className="eyebrow">MODULE 01 · V2.4</div><h1>Audit de l'expérience candidat</h1><p className="muted">Détecter les frictions avant qu'elles ne deviennent du silence candidat : joignabilité, préqualification, continuité relationnelle, SLA, stagnation et écoute.</p></div><div className="actions"><Link className="btn secondary" href="/experience">Observatoire</Link><Link className="btn secondary" href="/actions">Centre d'actions</Link></div></div>
  <div className="grid"><div className="card"><div className="muted">Score d'expérience opérationnelle</div><div className="score">{audit.score==null?"—":`${audit.score}/100`}</div><div className={statusClass(audit.level)}>{auditLevelLabel(audit.level)}</div></div><div className="card"><div className="muted">Axes maîtrisés</div><div className="score">{audit.strengths}</div></div><div className="card"><div className="muted">Frictions probables</div><div className="score">{audit.risks}</div></div><div className="card"><div className="muted">Parcours stagnants</div><div className="score">{stagnant.length}</div></div></div>
  <div className="grid" style={{marginTop:16}}>{audit.axes.map(a=><div className="card" key={a.key}><div className="sectionHeader"><strong>{a.label}</strong><span className={statusClass(a.level)}>{a.score==null?"—":`${a.score}/100`} · {auditLevelLabel(a.level)}</span></div><p>{a.summary}</p>{a.evidence.map(e=><div className="muted small" key={e}>• {e}</div>)}{a.recommendations.length>0&&<div style={{marginTop:12}}><strong>Action recommandée</strong>{a.recommendations.map(r=><p className="small" key={r}>{r}</p>)}</div>}</div>)}</div>
  <div className="card" style={{marginTop:16}}><h2>Priorités d'amélioration</h2>{audit.priorities.length===0?<p className="muted">Aucune priorité critique détectée dans les données disponibles.</p>:<ol>{audit.priorities.map(p=><li key={p}>{p}</li>)}</ol>}<p className="muted small">Cet audit analyse le fonctionnement observé dans Host Talent AI. Il ne prétend pas mesurer les points de contact externes non connectés au système.</p></div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Audit par mission</h2><p className="muted">Identifier les missions où le parcours candidat présente le plus de risque de friction.</p></div></div>{missionRows.length===0?<p className="muted">Aucune mission.</p>:missionRows.map(r=><div className="listRow" key={r.job.id}><div><Link href={`/jobs/${r.job.id}`}><strong>{r.job.title}</strong></Link><div className="muted small">{r.job.clientName||"Client non renseigné"} · {r.relevant} profil(s) pertinent(s) · {r.active} parcours actif(s) · {r.audit.risks} friction(s)</div></div><span className={statusClass(r.audit.level)}>{r.audit.score==null?"—":`${r.audit.score}/100`}</span></div>)}</div>
  <div className="grid" style={{marginTop:16}}><div className="card"><h2>Alertes opérationnelles</h2>{overdue.length===0&&stagnant.length===0&&sharesWithoutFeedback.length===0?<p className="muted">Aucune alerte active.</p>:<>{overdue.length>0&&<p><strong>{overdue.length}</strong> action(s) relationnelle(s) en retard.</p>}{stagnant.length>0&&<p><strong>{stagnant.length}</strong> parcours actif(s) sans prochaine action planifiée.</p>}{sharesWithoutFeedback.length>0&&<p><strong>{sharesWithoutFeedback.length}</strong> partage(s) client sans retour dans le SLA.</p>}</>}</div><div className="card"><h2>Périmètre mesuré</h2><p className="muted">SLA candidat : {org?.candidateResponseSlaHours||24} h · suivi entretien : {org?.interviewFollowupSlaHours||48} h · retour client : {org?.clientFeedbackSlaHours||72} h.</p><p className="muted">Le Module 01 utilise les données réellement tracées dans Host Talent AI : CV, matchings, pipeline, activités, relances, partages client et retours candidat.</p></div></div>
 </>;
}
