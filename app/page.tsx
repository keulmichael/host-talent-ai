import Link from "next/link";
import { prisma } from "./lib/db";
import { stageLabel } from "./lib/pipeline";
import { requireUser } from "./lib/auth";
import { classifyMatch, summarizeMatches } from "./lib/matchPriority";
import RecomputeAllButton from "./RecomputeAllButton";
import {HorizontalBars} from "./components/InsightCharts";

export const dynamic = "force-dynamic";

export default async function Dashboard(){
  const user=await requireUser();
  const organizationId=user.organizationId;
  const now=new Date();
  const d7=new Date(now.getTime()+7*86400000);
  const [jobCount,candidateCount,shortlisted,surveyResponseCount,dueActions,overdueActions,recentJobs,activePipeline,allMatches]=await Promise.all([
    prisma.job.count({where:{organizationId}}),prisma.candidate.count({where:{organizationId}}),
    prisma.match.count({where:{organizationId,stage:{in:["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"]}}}),
    prisma.candidateSurveyResponse.count({where:{survey:{organizationId}}}),
    prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{gte:now,lte:d7}}}),prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{lt:now}}}),
    prisma.job.findMany({where:{organizationId},take:4,orderBy:{createdAt:"desc"},include:{matches:{where:{organizationId},select:{score:true}}}}),
    prisma.match.findMany({where:{organizationId,stage:{not:"NEW"}},take:5,orderBy:{updatedAt:"desc"},include:{candidate:true,job:true,activities:{where:{status:"PLANNED"},orderBy:{dueAt:"asc"},take:1}}}),
    prisma.match.findMany({where:{organizationId},select:{id:true,candidateId:true,jobId:true,score:true,missing:true,questions:true,stage:true,candidate:{select:{id:true,fullName:true,availability:true,dailyRate:true,salaryExpectation:true}},job:{select:{id:true,title:true,mustHave:true,shouldHave:true}}}})
  ]);

  const enriched=allMatches.map(m=>({...m,mustHave:m.job.mustHave,shouldHave:m.job.shouldHave,availability:m.candidate.availability,dailyRate:m.candidate.dailyRate,salaryExpectation:m.candidate.salaryExpectation}));
  const summary=summarizeMatches(enriched);
  const newMatches=enriched.filter(m=>m.stage==="NEW");
  const newSummary=summarizeMatches(newMatches);
  const bestByCandidate=new Map<string,{match:typeof newMatches[number];priority:ReturnType<typeof classifyMatch>}>();
  for(const m of newMatches){const priority=classifyMatch(m);if(!priority.isRelevant)continue;const current=bestByCandidate.get(m.candidateId);if(!current||priority.reviewRank>current.priority.reviewRank)bestByCandidate.set(m.candidateId,{match:m,priority});}
  const reviewQueue=[...bestByCandidate.values()].filter(x=>x.priority.isPriority&&x.priority.needsHumanDecision).sort((a,b)=>b.priority.reviewRank-a.priority.reviewRank).slice(0,8);

  const funnel=[
    {label:"Matchings analysés",value:summary.analyzed,meta:"couples candidat × mission évalués automatiquement"},
    {label:"Adéquations pertinentes",value:newSummary.relevant,meta:"score ≥ 60, encore hors pipeline métier"},
    {label:"Matchings prioritaires",value:newSummary.priorityMatches,meta:"score ≥ 75"},
    {label:"Candidats prioritaires uniques",value:newSummary.priorityCandidates,meta:"candidats dédupliqués"},
    {label:"Validations métier",value:newSummary.validationCandidates,meta:"indispensables ou souhaitables structurés non confirmés"}
  ];

  return <>
    <section className="dashboardHero"><div><div className="eyebrow">V2.7 · TRI INTELLIGENT</div><h1>Bonjour {user.fullName.split(" ")[0]}</h1><p className="muted">Host Talent AI analyse le volume automatiquement et concentre votre attention sur les candidatures qui méritent réellement une revue humaine.</p></div><div className="heroActions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/market">Observatoire général</Link><Link className="btn secondary" href="/talent">Observatoire Talent</Link><RecomputeAllButton/></div></section>

    <section className="kpiRow">
      <div className="kpiCard"><span>Matchings analysés</span><strong>{summary.analyzed}</strong><small>analysés automatiquement</small></div>
      <div className="kpiCard"><span>Adéquations pertinentes</span><strong>{newSummary.relevant}</strong><small>score ≥ 60, hors pipeline</small></div>
      <div className="kpiCard"><span>Candidats prioritaires</span><strong>{newSummary.priorityCandidates}</strong><small>uniques, score ≥ 75</small></div>
      <div className="kpiCard"><span>Validation métier</span><strong>{newSummary.validationCandidates}</strong><small>{newSummary.criticalCandidates} critique(s) · {newSummary.usefulCandidates} utile(s)</small></div>
      <div className="kpiCard"><span>Infos commerciales</span><strong>{newSummary.commercialCandidates}</strong><small>disponibilité, TJM ou salaire à compléter</small></div>
      <div className="kpiCard"><span>Profils en process</span><strong>{shortlisted}</strong><small>short-list et étapes suivantes</small></div>
    </section>

    <HorizontalBars title="Entonnoir de tri automatique" description="Les questions génériques ne déclenchent plus une validation. Seuls les critères structurés de la mission peuvent provoquer une revue métier ; disponibilité, TJM et salaire sont suivis séparément." items={funnel}/>

    <section className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">REVUE HUMAINE CIBLÉE</div><h2>À examiner en priorité</h2><p className="muted">Cette file contient uniquement les profils prioritaires pour lesquels un indispensable ou un souhaitable structuré de la mission reste réellement non confirmé.</p></div></div>
      {reviewQueue.length===0?<p className="muted">Aucun cas prioritaire nécessitant une validation métier pour le moment.</p>:reviewQueue.map(({match:m,priority})=><div className="reviewQueueRow" key={m.id}><div className="reviewQueueMain"><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><span>{m.job.title}</span><small>{priority.reason}</small></div><div className="reviewQueueMeta"><span className="scoreMini">{m.score}/100</span><span className="reviewBadge warning">{priority.needsCriticalValidation?"Validation critique":"Validation utile"}</span></div><div className="reviewQueueAction"><Link className="btn secondary" href={`/jobs/${m.job.id}`}>Examiner dans la mission</Link></div></div>)}
    </section>

    <section className="dashboardGrid" style={{marginTop:22}}><div className="card intelligenceCard"><div className="sectionHeader"><div><div className="eyebrow">Observatoires</div><h2>Deux niveaux de lecture</h2></div></div><div className="intelligenceList"><Link href="/market" className="featureTile"><strong>Observatoire général</strong><span>Tendances de l’emploi, signaux macro et pistes de nouveaux marchés pour le cabinet.</span><em>Observer le marché externe →</em></Link><Link href="/talent" className="featureTile"><strong>Observatoire Talent</strong><span>Demande des missions, offre brute, offre qualifiée, tensions et potentiel sous-exploité du vivier.</span><em>Observer le marché du cabinet →</em></Link><Link href="/experience" className="featureTile"><strong>Expérience candidat</strong><span>Retours, signaux faibles et qualité perçue du parcours.</span><em>{surveyResponseCount} retour(s) reçu(s) →</em></Link></div></div>
      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Missions</div><h2>Activité récente</h2></div><Link href="/jobs">Tout voir →</Link></div>{recentJobs.length===0?<p className="muted">Aucune mission récente.</p>:recentJobs.map(j=>{const best=j.matches.length?Math.max(...j.matches.map(m=>m.score)):null;return <div className="listRow" key={j.id}><div><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><div className="muted small">{best==null?"Pas encore analysée":`Meilleur score ${best}/100`}</div></div><span>→</span></div>})}</div>
      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Suivi</div><h2>Priorités opérationnelles</h2></div><Link href="/actions">Centre d’actions →</Link></div><div className="listRow"><span>Actions à venir ≤ 7 jours</span><strong>{dueActions}</strong></div><div className="listRow"><span>Relances en retard</span><strong>{overdueActions}</strong></div>{activePipeline.slice(0,3).map(m=>{const planned=m.activities[0];return <div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{m.job.title} · {stageLabel(m.stage)}{planned?` · ${planned.subject||planned.type}`:m.nextAction?` · ${m.nextAction}`:""}</div></div><span className="scoreMini">{m.score}</span></div>})}</div></section>
    <section className="workflowStrip"><div><strong>Analyser</strong><span>Tous les matchings automatiquement</span></div><b>→</b><div><strong>Prioriser</strong><span>Scores, preuves et critères structurés</span></div><b>→</b><div><strong>Valider</strong><span>Seulement les critères métier déterminants</span></div><b>→</b><div><strong>Compléter</strong><span>Disponibilité, TJM et salaire séparément</span></div></section>
  </>;
}
