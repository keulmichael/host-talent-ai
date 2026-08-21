import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { stageLabel } from "../../lib/pipeline";
import { requireUser } from "../../lib/auth";
import MatchButton from "./MatchButton";
import MatchActions from "../../MatchActions";
import QuickStageButton from "../../QuickStageButton";

export const dynamic = "force-dynamic";
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}

export default async function JobPage({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const[job,candidateCount]=await Promise.all([
  prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{candidate:true},orderBy:{score:"desc"}}}}),
  prisma.candidate.count({where:{organizationId:user.organizationId}})
 ]);
 if(!job)notFound();
 const shortlisted=job.matches.filter(m=>["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"].includes(m.stage)).length;
 return <>
  <div className="card"><div className="eyebrow">MISSION · V1.8</div><h1>{job.title}</h1><p className="muted">{job.clientName||"Client non renseigné"} · {job.location||"Localisation non renseignée"}</p><p>{job.description}</p>
   <div className="criteriaGrid"><div><strong>Indispensables</strong><p>{job.mustHave||"—"}</p></div><div><strong>Souhaitables</strong><p>{job.shouldHave||"—"}</p></div><div><strong>Optionnels</strong><p>{job.optional||"—"}</p></div></div>
   <div className="actions"><MatchButton jobId={job.id}/><Link className="btn secondary" href={`/jobs/${job.id}/compare`}>Comparer les profils</Link><Link className="btn secondary" href={`/jobs/${job.id}/client`}>Dossier client ({shortlisted})</Link><Link className="btn secondary" href={`/api/jobs/${job.id}/export`}>Export ATS/CRM</Link><Link className="btn secondary" href="/pipeline">Pipeline</Link></div>
  </div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Profils du vivier</h2><p className="muted">{job.matches.length} profil(s) analysé(s) sur {candidateCount} candidat(s). {shortlisted} profil(s) retenu(s) dans la short-list client.</p></div></div>
   {candidateCount===0?<p className="muted">Importe d'abord des CV.</p>:job.matches.length===0?<p className="muted">Lance l'analyse du vivier.</p>:job.matches.map(m=><div className="matchRow" key={m.id}>
    <div className="sectionHeader"><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{band(m.score)} · {stageLabel(m.stage)}</div></div><div className="scoreCompact">{m.score}/100</div></div>
    <p><strong>Correspondances :</strong> {m.matched||"—"}</p><p><strong>À vérifier :</strong> {m.missing||"—"}</p><p className="muted">{m.explanation}</p>
    {m.questions&&<><strong>Questions de préqualification :</strong><ul>{m.questions.split("\n").filter(Boolean).map(q=><li key={q}>{q}</li>)}</ul></>}
    <div className="actions">{m.stage==="NEW"&&<QuickStageButton matchId={m.id} stage="SHORTLIST" label="Ajouter à la short-list"/>}{m.stage==="SHORTLIST"&&<QuickStageButton matchId={m.id} stage="CLIENT" label="Marquer présenté client"/>}<Link className="btn secondary" href={`/candidates/${m.candidate.id}`}>Fiche candidat</Link></div>
    <details className="opsDetails"><summary>Suivi recruteur</summary><MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction}/></details>
   </div>)}
  </div>
 </>;
}
