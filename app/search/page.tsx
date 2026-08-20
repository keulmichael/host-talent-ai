import Link from "next/link";
import { prisma } from "../lib/db";
import { detectSkills } from "../lib/extract";
import { requireUser } from "../lib/auth";
import { semanticScore } from "../lib/semantic";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?:string; min?:string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = String(sp.q || "").trim();
  const min = Math.max(0, Math.min(100, Number(sp.min || 0) || 0));
  const pool = q ? await prisma.candidate.findMany({
    where: { organizationId:user.organizationId },
    include: { matches: { where:{organizationId:user.organizationId}, include:{job:true}, orderBy:{score:"desc"} } },
    orderBy: { createdAt:"desc" },
    take: 1000
  }) : [];

  const ranked = pool.map((candidate) => ({ candidate, semantic:semanticScore(q, candidate) }))
    .filter((x) => x.semantic.score > 0)
    .filter((x) => !min || x.candidate.matches.some((m) => m.score >= min))
    .sort((a,b) => b.semantic.score - a.semantic.score || (b.candidate.matches[0]?.score || 0) - (a.candidate.matches[0]?.score || 0))
    .slice(0,100);

  return <>
    <div className="card">
      <div className="eyebrow">RECHERCHE SÉMANTIQUE VIVIER · V1.7</div><h1>Retrouver un talent</h1>
      <p className="muted">La recherche comprend des familles de termes et synonymes métier, sans envoyer les CV à un service IA externe. Elle reste limitée au vivier de {user.organization.name}.</p>
      <form className="searchForm" method="GET">
        <input name="q" defaultValue={q} placeholder="Ex. consultant IA automatisation, SAP finance, recruteur Paris…" />
        <input name="min" type="number" min="0" max="100" defaultValue={min || ""} placeholder="Score mission min." />
        <button className="btn">Rechercher</button>
      </form>
    </div>
    {q && <div className="card" style={{marginTop:16}}><div className="sectionHeader"><h2>{ranked.length} résultat(s)</h2><span className="muted">Recherche : “{q}”</span></div>
      {ranked.length === 0 ? <p className="muted">Aucun candidat pertinent. Essaie une formulation plus large ou un autre concept métier.</p> : ranked.map(({candidate:c,semantic}) => {
        const skills = detectSkills(c.rawText);
        const best = c.matches[0];
        return <div className="matchRow" key={c.id}>
          <div className="sectionHeader"><div><Link href={`/candidates/${c.id}`}><strong>{c.fullName}</strong></Link><div className="muted small">{c.location || "Localisation à confirmer"} · {c.email || "E-mail non détecté"}</div></div><div><div className="scoreCompact">{semantic.score}/100</div><div className="muted small">pertinence recherche</div></div></div>
          <div>{skills.slice(0,10).map((s)=><span className="pill" key={s}>{s}</span>)}</div>
          {semantic.matched.length>0&&<p className="muted small">Indices reconnus : {semantic.matched.join(", ")}</p>}
          {best && <p className="muted small">Meilleure adéquation mission : <Link href={`/jobs/${best.jobId}`}>{best.job.title}</Link> · {best.score}/100</p>}
        </div>;
      })}
    </div>}
  </>;
}
