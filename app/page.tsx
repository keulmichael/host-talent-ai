import Link from "next/link";
import { prisma } from "./lib/db";
import { stageLabel } from "./lib/pipeline";
import { requireUser } from "./lib/auth";
import RecomputeAllButton from "./RecomputeAllButton";

export const dynamic = "force-dynamic";

export default async function Dashboard(){
 const user=await requireUser(); const organizationId=user.organizationId;
 const[jobCount,candidateCount,matchCount,recentJobs,topMatches,activePipeline,strong]=await Promise.all([
  prisma.job.count({where:{organizationId}}),
  prisma.candidate.count({where:{organizationId}}),
  prisma.match.count({where:{organizationId}}),
  prisma.job.findMany({where:{organizationId},take:5,orderBy:{createdAt:"desc"},include:{matches:{where:{organizationId},select:{score:true}}}}),
  prisma.match.findMany({where:{organizationId},take:5,orderBy:{score:"desc"},include:{candidate:true,job:true}}),
  prisma.match.findMany({where:{organizationId,stage:{not:"NEW"}},take:6,orderBy:{updatedAt:"desc"},include:{candidate:true,job:true}}),
  prisma.match.count({where:{organizationId,score:{gte:70}}})
 ]);
 return <>
  <div className="hero"><div><div className="eyebrow">COPILOTE RECRUTEUR · V1.6</div><h1>Du vivier au suivi opérationnel.</h1><p className="muted">{user.organization.name} · espace cloisonné. Analyse des CV, matching explicable, recherche et pipeline candidat.</p></div><div className="actions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/search">Rechercher un talent</Link><Link className="btn secondary" href="/pipeline">Pipeline</Link><RecomputeAllButton/></div></div>
  <div className="grid"><div className="card"><div className="muted">Missions</div><div className="score">{jobCount}</div></div><div className="card"><div className="muted">Candidats</div><div className="score">{candidateCount}</div></div><div className="card"><div className="muted">Matchings</div><div className="score">{matchCount}</div></div><div className="card"><div className="muted">Adéquations ≥ 70</div><div className="score">{strong}</div></div></div>
  <div className="grid" style={{marginTop:16}}><div className="card"><div className="sectionHeader"><h2>Missions récentes</h2><Link href="/jobs">Tout voir →</Link></div>{recentJobs.length===0?<p className="muted">Aucune mission.</p>:recentJobs.map(j=>{const best=j.matches.length?Math.max(...j.matches.map(m=>m.score)):null;return <div className="listRow" key={j.id}><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><span className="muted">{best==null?"Pas encore analysée":`meilleur score ${best}/100`}</span></div>})}</div>
   <div className="card"><div className="sectionHeader"><h2>Meilleures correspondances</h2><Link href="/search">Recherche →</Link></div>{topMatches.length===0?<p className="muted">Aucun matching.</p>:topMatches.map(m=><div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small"><Link href={`/jobs/${m.job.id}`}>{m.job.title}</Link></div></div><span className="scoreMini">{m.score}</span></div>)}</div></div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><h2>Suivi en cours</h2><Link href="/pipeline">Ouvrir le pipeline →</Link></div>{activePipeline.length===0?<p className="muted">Aucun profil n'a encore été déplacé dans le pipeline.</p>:activePipeline.map(m=><div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{m.job.title} · {stageLabel(m.stage)}{m.nextAction?` · ${m.nextAction}`:""}</div></div><span className="scoreMini">{m.score}</span></div>)}</div>
 </>;
}
