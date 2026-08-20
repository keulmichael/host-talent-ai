import { prisma } from "../../lib/db";
import { notFound } from "next/navigation";
import MatchButton from "./MatchButton";

export const dynamic = "force-dynamic";

export default async function P({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { matches: { include: { candidate: true }, orderBy: { score: "desc" } } }
  });
  if (!job) notFound();

  const candidateCount = await prisma.candidate.count();

  return (
    <>
      <div className="card">
        <div className="eyebrow">MISSION</div>
        <h1>{job.title}</h1>
        <p className="muted">{job.clientName || "—"} · {job.location || "—"}</p>
        <p>{job.description}</p>
        <MatchButton jobId={job.id} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Profils du vivier</h2>
        <p className="muted">{job.matches.length} profil(s) analysé(s) sur {candidateCount} candidat(s) présents dans le vivier.</p>

        {job.matches.length === 0 && <p>Aucun matching calculé. Cliquez sur « Rechercher dans le vivier ».</p>}

        {job.matches.map((m) => (
          <div key={m.id} style={{ padding: "18px 0", borderBottom: "1px solid #ffffff12" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
              <strong>{m.candidate.fullName}</strong>
              <strong>{m.score}/100</strong>
            </div>
            <p><strong>Correspondances :</strong> {m.matched || "—"}</p>
            <p><strong>À vérifier :</strong> {m.missing || "—"}</p>
            <p className="muted">{m.explanation}</p>
            {m.questions && (
              <>
                <strong>Questions de préqualification suggérées :</strong>
                <ul>
                  {m.questions.split("\n").filter(Boolean).map((q) => <li key={q}>{q}</li>)}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
