import Link from "next/link";
import { prisma } from "../lib/db";
import { requireUser } from "../lib/auth";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const user = await requireUser();
  const jobs = await prisma.job.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    include: { matches: { where: { organizationId:user.organizationId }, select: { score: true } } }
  });
  return <div className="card">
    <div className="sectionHeader"><div><div className="eyebrow">MISSIONS</div><h1>Missions</h1><p className="muted">{jobs.length} mission(s) enregistrée(s) pour {user.organization.name}.</p></div><Link className="btn" href="/jobs/new">Nouvelle mission</Link></div>
    {jobs.length === 0 ? <p className="muted">Aucune mission pour le moment.</p> : <div className="tableWrap"><table>
      <thead><tr><th>Mission</th><th>Client</th><th>Localisation</th><th>Profils analysés</th><th>Meilleur score</th><th></th></tr></thead>
      <tbody>{jobs.map((job) => {
        const best = job.matches.length ? Math.max(...job.matches.map((m) => m.score)) : null;
        return <tr key={job.id}><td><strong>{job.title}</strong></td><td>{job.clientName || "—"}</td><td>{job.location || "—"}</td><td>{job.matches.length}</td><td>{best == null ? "—" : `${best}/100`}</td><td><Link href={`/jobs/${job.id}`}>Ouvrir →</Link></td></tr>;
      })}</tbody>
    </table></div>}
  </div>;
}
