import Link from "next/link";
import { prisma } from "./lib/db";
import { stageLabel } from "./lib/pipeline";
import { requireUser } from "./lib/auth";
import RecomputeAllButton from "./RecomputeAllButton";

export const dynamic = "force-dynamic";

export default async function Dashboard(){
 const user=await requireUser(); const organizationId=user.organizationId; const now=new Date(); const d30=new Date(now.getTime()+30*86400000); const d7=new Date(now.getTime()+7*86400000);
 const[jobCount,candidateCount,matchCount,recentJobs,topMatches,activePipeline,strong,expiring,privateFiles,shortlisted,activeShares,feedbackCount,dueActions,overdueActions]=await Promise.all([
  prisma.job.count({where:{organizationId}}),
  prisma.candidate.count({where:{organizationId}}),
  prisma.match.count({where:{organizationId}}),
  prisma.job.findMany({where:{organizationId},take:5,orderBy:{createdAt:"desc"},include:{matches:{where:{organizationId},select:{score:true}},clientShares:{where:{organizationId,active:true},select:{id:true}}}}),
  prisma.match.findMany({where:{organizationId},take:5,orderBy:{score:"desc"},include:{candidate:true,job:true}}),
  prisma.match.findMany({where:{organizationId,stage:{not:"NEW"}},take:6,orderBy:{updatedAt:"desc"},include:{candidate:true,job:true,activities:{where:{status:"PLANNED"},orderBy:{dueAt:"asc"},take:1}}}),
  prisma.match.count({where:{organizationId,score:{gte:70}}}),
  prisma.candidate.count({where:{organizationId,retentionUntil:{lte:d30}}}),
  prisma.candidate.count({where:{organizationId,filePathname:{not:null}}}),
  prisma.match.count({where:{organizationId,stage:{in:["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"]}}}),
  prisma.clientShare.count({where:{organizationId,active:true,expiresAt:{gt:now}}}),
  prisma.clientFeedback.count({where:{share:{organizationId}}}),
  prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{gte:now,lte:d7}}}),
  prisma.candidateActivity.count({where:{organizationId,status:"PLANNED",dueAt:{lt:now}}})
 ]);
 return <>
  <div className="hero"><div><div className="eyebrow">COPILOTE RECRUTEUR · V2.1 · MODULE 02</div><h1>Du vivier au suivi candidat.</h1><p className="muted">{user.organization.name} · matching explicable, parcours relationnel, rappels, short-list client et suivi opérationnel.</p></div><div className="actions"><Link className="btn" href="/jobs/new">Créer une mission</Link><Link className="btn secondary" href="/search">Recherche sémantique</Link><Link className="btn secondary" href="/pipeline">Pipeline</Link><RecomputeAllButton/></div></div>
  <div className="grid"><div className="card"><div className="muted">Missions</div><div className="score">{jobCount}</div></div><div className="card"><div className="muted">Candidats</div><div className="score">{candidateCount}</div></div><div className="card"><div className="muted">Actions à venir ≤ 7 jours</div><div className="score">{dueActions}</div></div><div className="card"><div className="muted">Relances en retard</div><div className="score">{overdueActions}</div></div><div className="card"><div className="muted">Profils en short-list / process</div><div className="score">{shortlisted}</div></div><div className="card"><div className="muted">Liens client actifs</div><div className="score">{activeShares}</div></div><div className="card"><div className="muted">Retours client reçus</div><div className="score">{feedbackCount}</div></div></div>
  {user.role==="ADMIN"&&<div className="grid" style={{marginTop:16}}><div className="card"><div className="muted">CV originaux stockés en privé</div><div className="score">{privateFiles}</div></div><div className="card"><div className="muted">Conservation à revoir ≤ 30 jours</div><div className="score">{expiring}</div><Link href="/admin/privacy" className="small">Ouvrir Confidentialité →</Link></div><div className="card"><div className="muted">Adéquations ≥ 70</div><div className="score">{strong}</div></div><div className="card"><div className="muted">Matchings calculés</div><div className="score">{matchCount}</div></div></div>}
  <div className="grid" style={{marginTop:16}}><div className="card"><div className="sectionHeader"><h2>Missions récentes</h2><Link href="/jobs">Tout voir →</Link></div>{recentJobs.length===0?<p className="muted">Aucune mission.</p>:recentJobs.map(j=>{const best=j.matches.length?Math.max(...j.matches.map(m=>m.score)):null;return <div className="listRow" key={j.id}><div><Link href={`/jobs/${j.id}`}><strong>{j.title}</strong></Link><div className="muted small"><Link href={`/jobs/${j.id}/compare`}>Comparer</Link> · <Link href={`/jobs/${j.id}/client`}>Dossier client</Link> · <Link href={`/jobs/${j.id}/shares`}>Portail client ({j.clientShares.length})</Link></div></div><span className="muted">{best==null?"Pas encore analysée":`meilleur score ${best}/100`}</span></div>})}</div>
   <div className="card"><div className="sectionHeader"><h2>Meilleures correspondances</h2><Link href="/search">Recherche →</Link></div>{topMatches.length===0?<p className="muted">Aucun matching.</p>:topMatches.map(m=><div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small"><Link href={`/jobs/${m.job.id}`}>{m.job.title}</Link></div></div><span className="scoreMini">{m.score}</span></div>)}</div></div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><h2>Suivi en cours</h2><Link href="/pipeline">Ouvrir le pipeline →</Link></div>{activePipeline.length===0?<p className="muted">Aucun profil n'a encore été déplacé dans le pipeline.</p>:activePipeline.map(m=>{const planned=m.activities[0];return <div className="listRow" key={m.id}><div><Link href={`/candidates/${m.candidateId}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{m.job.title} · {stageLabel(m.stage)}{planned?` · action planifiée : ${planned.subject||planned.type}${planned.dueAt?` le ${planned.dueAt.toLocaleString("fr-FR")}`:""}`:m.nextAction?` · ${m.nextAction}`:""}</div></div><span className="scoreMini">{m.score}</span></div>})}</div>
 </>;
}
