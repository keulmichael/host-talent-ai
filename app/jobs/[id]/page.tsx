import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import MatchButton from "./MatchButton";

export const dynamic = "force-dynamic";

function band(score: number) {
  if (score >= 85) return "Très forte adéquation";
  if (score >= 70) return "Bonne adéquation";
  if (score >= 55) return "Adéquation partielle";
  if (score >= 40) return "Profil à approfondir";
  return "Faible adéquation apparente";
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, candidateCount] = await Promise.all([
    prisma.job.findUnique({ where: { id }, include: { matches: { include: { candidate: true }, orderBy: { score: "desc" } } } }),
    prisma.candidate.count()
  ]);
  if (!job) notFound();

  return <>
    <div className="card">
      <div className="eyebrow">MISSION</div>
      <h1>{job.title}</h1>
      <p className="muted">{job.clientName || "Client non renseigné"} · {job.location || "Localisation non renseignée"}</p>
      <p>{job.description}</p>
      <div className="criteriaGrid">
        <div><strong>Indispensables</strong><p>{job.mustHave || "—"}</p></div>
        <div><strong>Souhaitables</strong><p>{job.shouldHave || "—"}</p></div>
        <div><strong>Optionnels</strong><p>{job.optional || "—"}</p></div>
      </div>
      <MatchButton jobId={job.id}/>
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="sectionHeader"><div><h2>Profils du vivier</h2><p className="muted">{job.matches.length} profil(s) analysé(s) sur {candidateCount} candidat(s) présents dans le vivier.</p></div></div>
      {candidateCount === 0 ? <p className="muted">Importe d'abord des CV dans le vivier.</p> : job.matches.length === 0 ? <p className="muted">Clique sur « Rechercher dans le vivier » pour lancer l'analyse.</p> : job.matches.map((m) => <div className="matchRow" key={m.id}>
        <div className="sectionHeader"><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{band(m.score)}</div></div><div className="scoreCompact">{m.score}/100</div></div>
        <p><strong>Correspondances :</strong> {m.matched || "—"}</p>
        <p><strong>À vérifier :</strong> {m.missing || "—"}</p>
        <p className="muted">{m.explanation}</p>
        {m.questions && <><strong>Questions de préqualification suggérées :</strong><ul>{m.questions.split("\n").filter(Boolean).map((q) => <li key={q}>{q}</li>)}</ul></>}
      </div>)}
    </div>
  </>;
}
