import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { detectNegatedSkills, detectSkills } from "../../lib/extract";

export const dynamic = "force-dynamic";

function band(score: number) {
  if (score >= 85) return "Très forte adéquation";
  if (score >= 70) return "Bonne adéquation";
  if (score >= 55) return "Adéquation partielle";
  if (score >= 40) return "Profil à approfondir";
  return "Faible adéquation apparente";
}

export default async function CandidateDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { matches: { include: { job: true }, orderBy: { score: "desc" } } }
  });
  if (!candidate) notFound();
  const skills = detectSkills(candidate.rawText);
  const negated = detectNegatedSkills(candidate.rawText);

  return <>
    <div className="card">
      <div className="eyebrow">CANDIDAT</div>
      <h1>{candidate.fullName}</h1>
      <p className="muted">{candidate.location || "Localisation à confirmer"} · {candidate.email || "E-mail non détecté"} · {candidate.experienceYears ? `${candidate.experienceYears} ans d'expérience détectés` : "Expérience à confirmer"}</p>
      <h3>Compétences positives détectées</h3>
      <div>{skills.length ? skills.map((x) => <span className="pill" key={x}>{x}</span>) : <span className="muted">Aucune compétence structurée détectée.</span>}</div>
      {negated.length > 0 && <><h3 style={{marginTop:18}}>Mentions négatives ou limitées détectées</h3><p className="warningText">{negated.join(", ")}</p></>}
      <h3 style={{marginTop:18}}>Extrait du CV</h3>
      <p className="muted preline">{candidate.summary}</p>
    </div>

    <div className="card" style={{marginTop:16}}>
      <h2>Adéquation avec les missions</h2>
      {candidate.matches.length === 0 ? <p className="muted">Aucun matching calculé pour le moment.</p> : candidate.matches.map((m) => <div className="matchRow" key={m.id}>
        <div className="sectionHeader"><div><Link href={`/jobs/${m.job.id}`}><strong>{m.job.title}</strong></Link><div className="muted small">{m.job.clientName || "Client non renseigné"}</div></div><div className="scoreCompact">{m.score}/100</div></div>
        <div className="muted">{band(m.score)}</div>
        <p><strong>Correspondances :</strong> {m.matched || "—"}</p>
        <p><strong>À vérifier :</strong> {m.missing || "—"}</p>
        <p className="muted">{m.explanation}</p>
        {m.questions && <><strong>Questions suggérées</strong><ul>{m.questions.split("\n").filter(Boolean).map((q) => <li key={q}>{q}</li>)}</ul></>}
      </div>)}
    </div>
  </>;
}
