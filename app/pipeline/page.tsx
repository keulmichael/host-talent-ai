import Link from "next/link";
import { prisma } from "../lib/db";
import { PIPELINE_STAGES, stageLabel } from "../lib/pipeline";
import { requireUser } from "../lib/auth";
import { recommendedAction } from "../lib/relationship";
import MatchActions from "../MatchActions";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const user = await requireUser();
  const matches = await prisma.match.findMany({
    where: { organizationId: user.organizationId },
    include: { candidate: true, job: true, activities:{where:{status:"PLANNED"},orderBy:{dueAt:"asc"},take:1} },
    orderBy: [{ stage: "asc" }, { score: "desc" }]
  });

  return <>
    <div className="hero"><div><div className="eyebrow">PIPELINE · MODULE 02</div><h1>Suivi relationnel</h1><p className="muted">{user.organization.name} · chaque profil dispose maintenant d'une prochaine action, d'une préqualification et d'un historique de suivi.</p></div></div>
    <div className="pipelineGrid">
      {PIPELINE_STAGES.map((stage) => {
        const items = matches.filter((m) => m.stage === stage.value);
        return <section className="pipelineColumn" key={stage.value}>
          <div className="pipelineHeader"><strong>{stage.label}</strong><span className="pill">{items.length}</span></div>
          {items.length === 0 ? <p className="muted small">Aucun profil</p> : items.map((m) => {const rec=recommendedAction({stage:m.stage,score:m.score,missing:m.missing||"",questions:m.questions||"",candidateInterest:m.candidateInterest||null,availability:m.candidate.availability||null,dailyRate:m.candidate.dailyRate||null,salaryExpectation:m.candidate.salaryExpectation||null,candidateName:m.candidate.fullName,candidateEmail:m.candidate.email||null,jobTitle:m.job.title,clientName:m.job.clientName||null});const planned=m.activities[0];return <article className="pipelineCard" key={m.id}>
            <div className="sectionHeader"><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small"><Link href={`/jobs/${m.jobId}`}>{m.job.title}</Link></div></div><span className="scoreMini">{m.score}</span></div>
            <p className="small"><strong>Étape :</strong> {stageLabel(m.stage)}</p>
            <p className="small"><strong>Action recommandée :</strong> {rec.label}</p>
            {planned&&<p className="small"><strong>Action planifiée :</strong> {planned.subject||planned.type}{planned.dueAt?` · ${planned.dueAt.toLocaleString("fr-FR")}`:""}</p>}
            {m.nextAction && <p className="small"><strong>Note prochaine action :</strong> {m.nextAction}</p>}
            {m.recruiterNote && <p className="muted small preline">{m.recruiterNote}</p>}
            <div className="actions"><Link className="btn secondary" href={`/jobs/${m.jobId}`}>Ouvrir le parcours</Link></div>
            <details><summary>Mettre à jour</summary><MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction} candidateInterest={m.candidateInterest}/></details>
          </article>})}
        </section>;
      })}
    </div>
  </>;
}
