import Link from "next/link";
import { prisma } from "../lib/db";
import { detectSkills } from "../lib/extract";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?:string; min?:string }> }) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim();
  const min = Math.max(0, Math.min(100, Number(sp.min || 0) || 0));
  const candidates = q ? await prisma.candidate.findMany({
    where: { OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { rawText: { contains: q, mode: "insensitive" } },
      { skills: { contains: q, mode: "insensitive" } }
    ] },
    include: { matches: { include: { job:true }, orderBy: { score:"desc" } } },
    take: 100
  }) : [];
  const filtered = candidates.filter((c) => !min || c.matches.some((m) => m.score >= min));

  return <>
    <div className="card">
      <div className="eyebrow">RECHERCHE VIVIER</div><h1>Retrouver un talent</h1>
      <p className="muted">Recherche dans les CV, compétences, localisation, nom et e-mail. Le filtre de score permet de concentrer la revue sur les profils déjà comparés aux missions.</p>
      <form className="searchForm" method="GET">
        <input name="q" defaultValue={q} placeholder="Ex. n8n, SAP, finance, Paris, TypeScript…" />
        <input name="min" type="number" min="0" max="100" defaultValue={min || ""} placeholder="Score min." />
        <button className="btn">Rechercher</button>
      </form>
    </div>
    {q && <div className="card" style={{marginTop:16}}><div className="sectionHeader"><h2>{filtered.length} résultat(s)</h2><span className="muted">Recherche : “{q}”</span></div>
      {filtered.length === 0 ? <p className="muted">Aucun candidat correspondant. Essaie un terme plus large.</p> : filtered.map((c) => {
        const skills = detectSkills(c.rawText);
        const best = c.matches[0];
        return <div className="matchRow" key={c.id}>
          <div className="sectionHeader"><div><Link href={`/candidates/${c.id}`}><strong>{c.fullName}</strong></Link><div className="muted small">{c.location || "Localisation à confirmer"} · {c.email || "E-mail non détecté"}</div></div>{best && <div className="scoreCompact">{best.score}/100</div>}</div>
          <div>{skills.slice(0,10).map((s)=><span className="pill" key={s}>{s}</span>)}</div>
          {best && <p className="muted small">Meilleure adéquation : <Link href={`/jobs/${best.jobId}`}>{best.job.title}</Link></p>}
        </div>;
      })}
    </div>}
  </>;
}
