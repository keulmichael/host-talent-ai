import { prisma } from "../lib/db";
import { extractCandidate } from "../lib/extract";

export const dynamic = "force-dynamic";

export default async function P() {
  const candidates = await prisma.candidate.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="card">
      <h1>Vivier</h1>
      <table>
        <thead>
          <tr>
            <th>Candidat</th>
            <th>Localisation</th>
            <th>Expérience</th>
            <th>Compétences détectées</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const x = extractCandidate(c.rawText);
            return (
              <tr key={c.id}>
                <td>{c.fullName}</td>
                <td>{c.location || "—"}</td>
                <td>{x.years ? `${x.years} ans` : "À confirmer"}</td>
                <td>{x.skills.join(", ") || "Aucune compétence structurée détectée"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
