import Link from "next/link";
import { prisma } from "./lib/db";
import { stageLabel } from "./lib/pipeline";
import { requireUser } from "./lib/auth";
import RecomputeAllButton from "./RecomputeAllButton";

export const dynamic = "force-dynamic";

export default async function Dashboard(){
  const user=await requireUser();
  const organizationId=user.organizationId;
  const now=new Date();
  const d7=new Date(now.getTime()+7*86400000);
  const [jobCount,candidateCount,shortlisted,surveyResponseCount,dueActions,overdueActions,recentJobs,activePipeline]=await Promise.all([
    prisma.job.count({where:{organizationId}}),
    prisma.candidate.count({where:{organizationId}}),
    prisma.match.count({where:{organizationId,stage:{in:["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"]}}}),
    prisma.candidateSurveyResponse.count({where:{survey:{organizationId}}}),
    prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{gte:now,lte:d7}}}),
    prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{lt:now}}}),
    prisma.job.findMany({where:{organizationId},take:4,orderBy:{createdAt:"desc"},include:{matches:{where:{organizationId},select:{score:true}}}}),
    prisma.match.findMany({where:{organizationId,stage:{not:"NEW"}},take:5,orderBy:{updatedAt:"desc"},include:{candidate:true,job:true,activities:{where:{status:"PLANNED"},orderBy:{dueAt:"asc"},take:1}}})
  ]);

  return <>
    <section className="dashboardHero">
      <div><div className="eyebrow">V2.6 · Intelligence du vivier</div><h1>Bonjour {user.fullName.split(" ")[0]}</h1><p className="muted">Voici l’essentiel de votre activité recrutement.</p></div>
      <div className="heroActions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/candidates/new">Importer des CV</Link><RecomputeAllButton/></div>
    </section>

    <section className="kpiRow">
      <div className="kpiCard"><span>Missions</span><strong>{jobCount}</strong><small>actives et enregistrées</small></div>
      <div className="kpiCard"><span>Candidats</span><strong>{candidateCount}</strong><small>dans le vivier</small></div>
      <div className="kpiCard"><span>Profils en process</span><strong>{shortlisted}</strong><small>short-list et étapes suivantes</small></div>
      <div className="kpiCard"><span>Actions à venir</span><strong>{dueActions}</strong><small>dans les 7 prochains jours</small></div>
      <div className="kpiCard"><span>Relances en retard</span><strong>{overdueActions}</strong><small>à traiter</small></div>
    </section>

    <section className="dashboardGrid">
      <div className="card intelligenceCard"><div className="sectionHeader"><div><div className="eyebrow">Intelligence</div><h2>Observer et décider plus vite</h2></div></div>
        <div className="intelligenceList">
          <Link href="/talent" className="featureTile"><strong>Talent & Tendances</strong><span>Structure du vivier, compétences, séniorité, écarts et potentiel sous-exploité.</span><em>Explorer le vivier →</em></Link>
          <Link href="/experience" className="featureTile"><strong>Expérience candidat</strong><span>Retours, signaux faibles et qualité perçue du parcours.</span><em>{surveyResponseCount} retour(s) reçu(s) →</em></Link>
          <Link href="/audit" className="featureTile"><strong>Audit & Actions</strong><span>Friction, causes probables et plans d’action recommandés.</span><em>Lancer un audit →</em></Link>
        </div>
      </div>

      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Missions</div><h2>Activité récente</h2></div><Link href="/jobs">Tout voir →</Link></div>
        {recentJobs.length===0?<p className="muted">Aucune mission récente.</p>:recentJobs.map(j=>{const best=j.matches.length?Math.max(...j.matches.map(m=>m.score)):null;return <div className="listRow" key={j.id}><div><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><div className="muted small">{best==null?"Pas encore analysée":`Meilleur score ${best}/100`}</div></div><span>→</span></div>})}
      </div>

      <div className="card"><div className="sectionHeader"><div><div className="eyebrow">Suivi</div><h2>Priorités du moment</h2></div><Link href="/actions">Centre d’actions →</Link></div>
        {activePipeline.length===0?<p className="muted">Aucun profil en suivi pour le moment.</p>:activePipeline.map(m=>{const planned=m.activities[0];return <div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{m.job.title} · {stageLabel(m.stage)}{planned?` · ${planned.subject||planned.type}`:m.nextAction?` · ${m.nextAction}`:""}</div></div><span className="scoreMini">{m.score}</span></div>})}
      </div>
    </section>

    <section className="workflowStrip"><div><strong>Observer</strong><span>Vivier et expérience candidat</span></div><b>→</b><div><strong>Diagnostiquer</strong><span>Frottements et écarts</span></div><b>→</b><div><strong>Agir</strong><span>Actions au bon moment</span></div><b>→</b><div><strong>Améliorer</strong><span>Qualité et performance</span></div></section>
  </>;
}
