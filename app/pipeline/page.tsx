import Link from "next/link";
import { prisma } from "../lib/db";
import { PIPELINE_STAGES, stageLabel } from "../lib/pipeline";
import { requireUser } from "../lib/auth";
import MatchActions from "../MatchActions";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const user = await requireUser();
  const matches = await prisma.match.findMany({
    where: { organizationId: user.organizationId },
    include: { candidate: true, job: true },
    orderBy: [{ stage: "asc" }, { score: "desc" }]
  });

  return <>
    <div className="hero"><div><div className="eyebrow">PIPELINE</div><h1>Suivi opérationnel</h1><p className="muted">{user.organization.name} · short-list, contact, entretien, présentation client et suivi.</p></div></div>
    <div className="pipelineGrid">
      {PIPELINE_STAGES.map((stage) => {
        const items = matches.filter((m) => m.stage === stage.value);
        return <section className="pipelineColumn" key={stage.value}>
          <div className="pipelineHeader"><strong>{stage.label}</strong><span className="pill">{items.length}</span></div>
          {items.length === 0 ? <p className="muted small">Aucun profil</p> : items.map((m) => <article className="pipelineCard" key={m.id}>
            <div className="sectionHeader"><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small"><Link href={`/jobs/${m.jobId}`}>{m.job.title}</Link></div></div><span className="scoreMini">{m.score}</span></div>
            <p className="small"><strong>Étape :</strong> {stageLabel(m.stage)}</p>
            {m.nextAction && <p className="small"><strong>Prochaine action :</strong> {m.nextAction}</p>}
            {m.recruiterNote && <p className="muted small preline">{m.recruiterNote}</p>}
            <details><summary>Mettre à jour</summary><MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction}/></details>
          </article>)}
        </section>;
      })}
    </div>
  </>;
}
