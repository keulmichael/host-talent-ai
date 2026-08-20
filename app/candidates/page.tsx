import Link from "next/link";
import { prisma } from "../lib/db";
import { detectNegatedSkills, detectSkills } from "../lib/extract";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="card">
    <div className="sectionHeader"><div><div className="eyebrow">VIVIER</div><h1>Vivier candidats</h1><p className="muted">{candidates.length} candidat(s) enregistré(s).</p></div><Link className="btn" href="/candidates/new">Importer un CV</Link></div>
    {candidates.length === 0 ? <p className="muted">Aucun candidat pour le moment.</p> : <div className="tableWrap"><table>
      <thead><tr><th>Candidat</th><th>Localisation</th><th>Expérience</th><th>Compétences détectées</th><th>Attention</th><th></th></tr></thead>
      <tbody>{candidates.map((c) => {
        const skills = detectSkills(c.rawText);
        const negated = detectNegatedSkills(c.rawText);
        return <tr key={c.id}>
          <td><strong>{c.fullName}</strong><div className="muted small">{c.email || "E-mail non détecté"}</div></td>
          <td>{c.location || "—"}</td>
          <td>{c.experienceYears ? `${c.experienceYears} ans` : "À confirmer"}</td>
          <td>{skills.length ? skills.slice(0, 6).map((x) => <span className="pill" key={x}>{x}</span>) : "—"}</td>
          <td>{negated.length ? <span className="warningText">{negated.join(", ")}</span> : "—"}</td>
          <td><Link href={`/candidates/${c.id}`}>Voir →</Link></td>
        </tr>;
      })}</tbody>
    </table></div>}
  </div>;
}
