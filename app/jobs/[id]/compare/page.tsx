import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { stageLabel } from "../../../lib/pipeline";

export const dynamic="force-dynamic";

function list(v:string){return v.split(",").map(x=>x.trim()).filter(Boolean)}
function band(score:number){return score>=85?"Très forte":score>=70?"Bonne":score>=55?"Partielle":score>=40?"À approfondir":"Faible apparente"}

export default async function ComparePage({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{candidate:true},orderBy:{score:"desc"},take:5}}});
 if(!job)notFound();
 return <div className="card">
  <div className="sectionHeader"><div><div className="eyebrow">V1.8 · COMPARATEUR</div><h1>Comparer les candidats</h1><p className="muted">{job.title} · jusqu'aux 5 meilleurs profils du vivier.</p></div><div className="actions"><Link className="btn secondary" href={`/jobs/${job.id}`}>Retour mission</Link><Link className="btn" href={`/jobs/${job.id}/client`}>Dossier client</Link></div></div>
  {job.matches.length===0?<p className="muted">Aucun matching calculé.</p>:<div className="tableWrap"><table><thead><tr><th>Critère</th>{job.matches.map(m=><th key={m.id}><Link href={`/candidates/${m.candidateId}`}>{m.candidate.fullName}</Link></th>)}</tr></thead><tbody>
   <tr><td><strong>Score</strong></td>{job.matches.map(m=><td key={m.id}><strong>{m.score}/100</strong><div className="muted small">{band(m.score)}</div></td>)}</tr>
   <tr><td><strong>Étape</strong></td>{job.matches.map(m=><td key={m.id}>{stageLabel(m.stage)}</td>)}</tr>
   <tr><td><strong>Localisation</strong></td>{job.matches.map(m=><td key={m.id}>{m.candidate.location||"À confirmer"}</td>)}</tr>
   <tr><td><strong>Expérience</strong></td>{job.matches.map(m=><td key={m.id}>{m.candidate.experienceYears?`${m.candidate.experienceYears} ans détectés`:"À confirmer"}</td>)}</tr>
   <tr><td><strong>Correspondances</strong></td>{job.matches.map(m=><td key={m.id}>{list(m.matched).slice(0,10).map(x=><div key={x}>✓ {x}</div>)}</td>)}</tr>
   <tr><td><strong>À vérifier</strong></td>{job.matches.map(m=><td key={m.id}>{list(m.missing).slice(0,8).map(x=><div key={x}>• {x}</div>)}</td>)}</tr>
   <tr><td><strong>Synthèse</strong></td>{job.matches.map(m=><td key={m.id} className="muted">{m.explanation}</td>)}</tr>
  </tbody></table></div>}
  <p className="muted small" style={{marginTop:18}}>Le comparateur met les éléments du CV côte à côte. Il ne remplace pas la validation humaine du recruteur.</p>
 </div>;
}
