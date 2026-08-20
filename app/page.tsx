import Link from "next/link";
import { prisma } from "./lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [jobCount, candidateCount, matchCount, recentJobs, topMatches] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.match.count(),
    prisma.job.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { matches: { select: { score: true } } } }),
    prisma.match.findMany({ take: 5, orderBy: { score: "desc" }, include: { candidate: true, job: true } })
  ]);
  const strong = topMatches.filter((m) => m.score >= 70).length;
  return <>
    <div className="hero">
      <div><div className="eyebrow">COPILOTE RECRUTEUR · V1.2</div><h1>Transformez votre vivier en base de talents intelligente.</h1><p className="muted">Analyse des CV, matching explicable, détection du contexte et préparation de la préqualification.</p></div>
      <div className="actions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/candidates/new">Importer un CV</Link></div>
    </div>

    <div className="grid">
      <div className="card"><div className="muted">Missions</div><div className="score">{jobCount}</div></div>
      <div className="card"><div className="muted">Candidats</div><div className="score">{candidateCount}</div></div>
      <div className="card"><div className="muted">Matchings calculés</div><div className="score">{matchCount}</div></div>
      <div className="card"><div className="muted">Profils ≥ 70 parmi le top 5</div><div className="score">{strong}</div></div>
    </div>

    <div className="grid" style={{marginTop:16}}>
      <div className="card"><div className="sectionHeader"><h2>Missions récentes</h2><Link href="/jobs">Tout voir →</Link></div>{recentJobs.length === 0 ? <p className="muted">Aucune mission.</p> : recentJobs.map((j) => { const best = j.matches.length ? Math.max(...j.matches.map((m) => m.score)) : null; return <div className="listRow" key={j.id}><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><span className="muted">{best == null ? "Pas encore analysée" : `meilleur score ${best}/100`}</span></div>; })}</div>
      <div className="card"><h2>Meilleures correspondances</h2>{topMatches.length === 0 ? <p className="muted">Aucun matching.</p> : topMatches.map((m) => <div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small"><Link href={`/jobs/${m.job.id}`}>{m.job.title}</Link></div></div><span className="scoreMini">{m.score}</span></div>)}</div>
    </div>
  </>;
}
