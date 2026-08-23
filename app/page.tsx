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
  const bestCandidates=[...bestByCandidate.values()];
  const priorityCandidates=bestCandidates.filter(x=>x.priority.isPriority);
  const criticalCandidateCount=priorityCandidates.filter(x=>x.priority.needsCriticalValidation).length;
  const usefulCandidateCount=priorityCandidates.filter(x=>x.priority.needsUsefulValidation).length;
  const validationCandidateCount=priorityCandidates.filter(x=>x.priority.needsHumanDecision).length;
  const commercialCandidateCount=priorityCandidates.filter(x=>x.priority.hasCommercialInfoToComplete).length;
  const reviewQueue=priorityCandidates.filter(x=>x.priority.needsHumanDecision).sort((a,b)=>b.priority.reviewRank-a.priority.reviewRank).slice(0,8);
  const funnel=[{label:"Matchings analysés",value:summary.analyzed,meta:"couples candidat × mission évalués automatiquement"},{label:"Adéquations pertinentes",value:newSummary.relevant,meta:"score ≥ 60, encore hors pipeline métier"},{label:"Matchings prioritaires",value:newSummary.priorityMatches,meta:"score ≥ 75"},{label:"Candidats prioritaires uniques",value:priorityCandidates.length,meta:"meilleur matching retenu par candidat"},{label:"Validations métier",value:validationCandidateCount,meta:"sur le meilleur matching : indispensable ou écart souhaitable significatif"}];

  return <>
    <section className="dashboardHero"><div><div className="eyebrow">V2.7 · TRI INTELLIGENT</div><h1>Bonjour {user.fullName.split(" ")[0]}</h1><p className="muted">Host Talent AI analyse le volume automatiquement et concentre votre attention sur les candidatures qui méritent réellement une revue humaine.</p></div><div className="heroActions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/prequalifications">Préqualifier</Link><Link className="btn secondary" href="/market">Observatoire général</Link><Link className="btn secondary" href="/talent">Observatoire Talent</Link><RecomputeAllButton/></div></section>
    <section className="kpiRow">
      <div className="kpiCard"><span>Matchings analysés</span><strong>{summary.analyzed}</strong><small>analysés automatiquement</small></div>
      <div className="kpiCard"><span>Adéquations pertinentes</span><strong>{newSummary.relevant}</strong><small>score ≥ 60, hors pipeline</small></div>
      <div className="kpiCard"><span>Candidats prioritaires</span><strong>{priorityCandidates.length}</strong><small>uniques, meilleur matching score ≥ 75</small></div>
      <div className="kpiCard"><span>Validation métier</span><strong>{validationCandidateCount}</strong><small>{criticalCandidateCount} critique(s) · {usefulCandidateCount} utile(s)</small></div>
      <div className="kpiCard"><span>Infos commerciales</span><strong>{commercialCandidateCount}</strong><small>disponibilité, TJM ou salaire · <Link href="/prequalifications">ouvrir la file →</Link></small></div>
      <div className="kpiCard"><span>Profils en process</span><strong>{shortlisted}</strong><small>short-list et étapes suivantes</small></div>
    </section>
    <HorizontalBars title="Entonnoir de tri automatique" description="Le calcul est désormais dédupliqué par candidat sur son meilleur matching. Un souhaitable manquant isolé ne déclenche plus de revue humaine ; seuls un indispensable manquant, plusieurs souhaitables absents ou un souhaitable explicitement prioritaire remontent." items={funnel}/>
    <section className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">REVUE HUMAINE CIBLÉE</div><h2>À examiner en priorité</h2><p className="muted">Cette file est dédupliquée : un seul meilleur matching par candidat. Elle ne contient que les écarts susceptibles de modifier réellement la décision.</p></div></div>{reviewQueue.length===0?<p className="muted">Aucun cas prioritaire nécessitant une validation métier pour le moment.</p>:reviewQueue.map(({match:m,priority})=><div className="reviewQueueRow" key={m.id}><div className="reviewQueueMain"><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><span>{m.job.title}</span><small>{priority.reason}</small></div><div className="reviewQueueMeta"><span className="scoreMini">{m.score}/100</span><span className="reviewBadge warning">{priority.needsCriticalValidation?"Validation critique":"Validation utile"}</span></div><div className="reviewQueueAction"><Link className="btn secondary" href={`/jobs/${m.job.id}`}>Examiner dans la mission</Link></div></div>)}</section>
    <section className="dashboardGrid" style={{marginTop:22}}><div className="card intelligenceCard"><div className="sectionHeader"><div><div className="eyebrow">Observatoires</div><h2>Deux niveaux de lecture</h2></div></div><div className="intelligenceList"><Link href="/market" className="featureTile"><strong>Observatoire général</strong><span>Tendances de l’emploi, signaux macro et pistes de nouveaux marchés pour le cabinet.</span><em>Observer le marché externe →</em></Link><Link href="/talent" className="featureTile"><strong>Observatoire Talent</strong><span>Demande des missions, offre brute, offre qualifiée, tensions et potentiel sous-exploité du vivier.</span><em>Observer le marché du cabinet →</em></Link><Link href="/experience" className="featureTile"><strong>Expérience candidat</strong><span>Retours, signaux faibles et qualité perçue du parcours.</span><em>{surveyResponseCount} retour(s) reçu(s) →</em></Link></div></div>
      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Missions</div><h2>Activité récente</h2></div><Link href="/jobs">Tout voir →</Link></div>{recentJobs.length===0?<p className="muted">Aucune mission récente.</p>:recentJobs.map(j=>{const best=j.matches.length?Math.max(...j.matches.map(m=>m.score)):null;return <div className="listRow" key={j.id}><div><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><div className="muted small">{best==null?"Pas encore analysée":`Meilleur score ${best}/100`}</div></div><span>→</span></div>})}</div>
      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Suivi</div><h2>Priorités opérationnelles</h2></div><Link href="/actions">Centre d’actions →</Link></div><div className="listRow"><span>Actions à venir ≤ 7 jours</span><strong>{dueActions}</strong></div><div className="listRow"><span>Relances en retard</span><strong>{overdueActions}</strong></div>{activePipeline.slice(0,3).map(m=>{const planned=m.activities[0];return <div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{m.job.title} · {stageLabel(m.stage)}{planned?` · ${planned.subject||planned.type}`:m.nextAction?` · ${m.nextAction}`:""}</div></div><span className="scoreMini">{m.score}</span></div>})}</div></section>
    <section className="workflowStrip"><div><strong>Analyser</strong><span>Tous les matchings automatiquement</span></div><b>→</b><div><strong>Prioriser</strong><span>Meilleur matching par candidat</span></div><b>→</b><div><strong>Valider</strong><span>Seulement les écarts métier significatifs</span></div><b>→</b><Link href="/prequalifications"><strong>Compléter</strong><span>Disponibilité, TJM et salaire en masse</span></Link></section>
  </>;
}
