import Link from "next/link";
import { prisma } from "../lib/db";
import { detectNegatedSkills, detectSkills } from "../lib/extract";
import { requireUser } from "../lib/auth";

export const dynamic = "force-dynamic";

export default async function CandidatesPage(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},orderBy:{createdAt:"desc"},include:{matches:{where:{organizationId:user.organizationId},orderBy:{score:"desc"},take:1,include:{job:true}}}});
 return <div className="card"><div className="sectionHeader"><div><div className="eyebrow">VIVIER</div><h1>Vivier candidats</h1><p className="muted">{candidates.length} candidat(s) enregistré(s) pour {user.organization.name}.</p></div><div className="actions"><Link className="btn secondary" href="/search">Rechercher</Link><a className="btn secondary" href="/api/export/candidates">Exporter CSV</a><Link className="btn" href="/candidates/new">Importer un CV</Link></div></div>
 {candidates.length===0?<p className="muted">Aucun candidat pour le moment.</p>:<div className="tableWrap"><table><thead><tr><th>Candidat</th><th>Localisation</th><th>Expérience</th><th>Compétences</th><th>Meilleure mission</th><th>Score</th><th></th></tr></thead><tbody>{candidates.map(c=>{const skills=detectSkills(c.rawText),negated=detectNegatedSkills(c.rawText),best=c.matches[0];return <tr key={c.id}><td><strong>{c.fullName}</strong><div className="muted small">{c.email||"E-mail non détecté"}</div>{negated.length>0&&<div className="warningText small">À clarifier : {negated.slice(0,2).join(", ")}</div>}</td><td>{c.location||"—"}</td><td>{c.experienceYears?`${c.experienceYears} ans`:"À confirmer"}</td><td>{skills.length?skills.slice(0,6).map(x=><span className="pill" key={x}>{x}</span>):"—"}</td><td>{best?<Link href={`/jobs/${best.jobId}`}>{best.job.title}</Link>:"—"}</td><td>{best?<strong>{best.score}/100</strong>:"—"}</td><td><Link href={`/candidates/${c.id}`}>Ouvrir →</Link></td></tr>})}</tbody></table></div>}
 </div>;
}
