import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { stageLabel } from "../../lib/pipeline";
import { requireUser } from "../../lib/auth";
import MatchButton from "./MatchButton";
import MatchActions from "../../MatchActions";
import QuickStageButton from "../../QuickStageButton";
import CandidateCommercial from "../../CandidateCommercial";

export const dynamic = "force-dynamic";
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}
function recommendation(score:number,missing:string){
 const blockers=missing.split(",").map(x=>x.trim()).filter(Boolean).length;
 if(score>=85&&blockers===0)return"Profil prioritaire à examiner en entretien";
 if(score>=70&&blockers===0)return"Profil pertinent à approfondir";
 if(score>=70)return"Bon potentiel, points requis à valider";
 if(score>=55)return"Profil à qualifier avant positionnement";
 return"Adéquation à approfondir avant positionnement";
}
function evidenceCounts(explanation:string){
 const confirmed=Number(explanation.match(/Preuves CV\s*:\s*(\d+)/i)?.[1]||explanation.match(/Preuves\s*:\s*(\d+)/i)?.[1]||0);
 const required=Number(explanation.match(/(\d+) critère\(s\) requis à vérifier/i)?.[1]||0);
 const optional=Number(explanation.match(/(\d+) critère\(s\) optionnel\(s\) non confirmé/i)?.[1]||0);
 const years=explanation.match(/Ancienneté détectée\s*:\s*(\d+) ans/i)?.[1]||null;
 return{confirmed,required,optional,years};
}

export default async function JobPage({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const[job,candidateCount]=await Promise.all([
  prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{candidate:true},orderBy:{score:"desc"}},clientShares:{where:{organizationId:user.organizationId},select:{active:true}}}}),
  prisma.candidate.count({where:{organizationId:user.organizationId}})
 ]);
 if(!job)notFound();
 const shortlisted=job.matches.filter(m=>["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"].includes(m.stage)).length;
 const activeShares=job.clientShares.filter(s=>s.active).length;
 return <>
  <div className="card"><div className="eyebrow">MISSION · V2.0</div><h1>{job.title}</h1><p className="muted">{job.clientName||"Client non renseigné"} · {job.location||"Localisation non renseignée"}</p><p>{job.description}</p>
   <div className="criteriaGrid"><div><strong>Indispensables</strong><p>{job.mustHave||"—"}</p></div><div><strong>Souhaitables</strong><p>{job.shouldHave||"—"}</p></div><div><strong>Optionnels</strong><p>{job.optional||"—"}</p></div></div>
   <div className="actions"><MatchButton jobId={job.id}/><Link className="btn secondary" href={`/jobs/${job.id}/compare`}>Comparer les profils</Link><Link className="btn secondary" href={`/jobs/${job.id}/client`}>Dossier client ({shortlisted})</Link><Link className="btn secondary" href={`/jobs/${job.id}/shares`}>Portail client ({activeShares})</Link><Link className="btn secondary" href={`/api/jobs/${job.id}/export`}>Export ATS/CRM</Link><Link className="btn secondary" href="/pipeline">Pipeline</Link></div>
  </div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Profils du vivier</h2><p className="muted">{job.matches.length} profil(s) analysé(s) sur {candidateCount} candidat(s). {shortlisted} profil(s) retenu(s) dans la short-list client.</p></div></div>
   {candidateCount===0?<p className="muted">Importe d'abord des CV.</p>:job.matches.length===0?<p className="muted">Lance l'analyse du vivier.</p>:job.matches.map(m=>{const counts=evidenceCounts(m.explanation||"");const missing=m.missing?.split(",").map(x=>x.trim()).filter(Boolean)||[];return <div className="matchRow" key={m.id}>
    <div className="sectionHeader"><div><Link href={`/candidates/${m.candidate.id}`}><strong>{m.candidate.fullName}</strong></Link><div className="muted small">{band(m.score)} · {stageLabel(m.stage)}</div></div><div className="scoreCompact">{m.score}/100</div></div>
    <div className="decisionSummary"><strong>{recommendation(m.score,m.missing||"")}</strong><span>Le score assiste la revue du recruteur et ne constitue pas une décision automatique.</span></div>
    <div className="criteriaGrid decisionMetrics"><div><strong>Preuves CV</strong><p>{counts.confirmed||"—"} critère(s) confirmé(s)</p></div><div><strong>Points requis</strong><p>{missing.length===0?"Aucun point bloquant":`${missing.length} à valider`}</p></div><div><strong>Expérience</strong><p>{counts.years?`${counts.years} ans détectés`:"À confirmer"}</p></div></div>
    <p><strong>Correspondances :</strong> {m.matched||"—"}</p>{missing.length>0&&<p><strong>À vérifier :</strong> {m.missing}</p>}
    <div className="criteriaGrid"><div><strong>Disponibilité</strong><p>{m.candidate.availability||"À confirmer"}</p></div><div><strong>TJM</strong><p>{m.candidate.dailyRate?`${m.candidate.dailyRate} € / jour`:"À confirmer"}</p></div><div><strong>Prétention salariale</strong><p>{m.candidate.salaryExpectation?`${m.candidate.salaryExpectation.toLocaleString("fr-FR")} € / an`:"À confirmer"}</p></div></div>
    {m.questions&&<><strong>Questions de préqualification :</strong><ul>{m.questions.split("\n").filter(Boolean).map(q=><li key={q}>{q}</li>)}</ul></>}
    <div className="actions">{m.stage==="NEW"&&<QuickStageButton matchId={m.id} stage="SHORTLIST" label="Ajouter à la short-list"/>}{m.stage==="SHORTLIST"&&<QuickStageButton matchId={m.id} stage="CLIENT" label="Marquer présenté client"/>}<Link className="btn secondary" href={`/candidates/${m.candidate.id}`}>Fiche candidat</Link></div>
    <details className="opsDetails"><summary>Voir l’analyse détaillée</summary><p className="muted">{m.explanation}</p>{counts.optional>0&&<p className="muted">{counts.optional} critère(s) optionnel(s) non confirmé(s), sans caractère bloquant.</p>}</details>
    <details className="opsDetails"><summary>Suivi recruteur et préqualification</summary><MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction}/><CandidateCommercial candidateId={m.candidate.id} availability={m.candidate.availability} dailyRate={m.candidate.dailyRate} salaryExpectation={m.candidate.salaryExpectation}/></details>
   </div>})}
  </div>
 </>;
}
