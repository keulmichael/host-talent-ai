import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { detectNegatedSkills, detectSkills } from "../../lib/extract";
import { stageLabel } from "../../lib/pipeline";
import { requireUser } from "../../lib/auth";
import MatchActions from "../../MatchActions";
import CandidateCommercial from "../../CandidateCommercial";
import CommercialPrequalButton from "../../CommercialPrequalButton";
import RelationshipPanel from "../../RelationshipPanel";
import DeleteCandidateButton from "../../DeleteCandidateButton";
import CandidateAiAnalysis from "../../CandidateAiAnalysis";

export const dynamic = "force-dynamic";
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}
function formatBytes(n:number|null){if(!n)return "—";return n<1024?`${n} o`:n<1024*1024?`${Math.round(n/1024)} Ko`:`${(n/1024/1024).toFixed(1)} Mo`}

export default async function CandidateDetail({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const[candidate,messageTemplates]=await Promise.all([
  prisma.candidate.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{job:true,activities:{orderBy:{createdAt:"desc"},take:12}},orderBy:{score:"desc"}}}}),
  prisma.messageTemplate.findMany({where:{organizationId:user.organizationId,active:true},select:{type:true,subject:true,body:true}})
 ]);if(!candidate)notFound();
 const templates=Object.fromEntries(messageTemplates.map(t=>[t.type,{subject:t.subject,body:t.body}]));
 const skills=detectSkills(candidate.rawText),negated=detectNegatedSkills(candidate.rawText);const expired=Boolean(candidate.retentionUntil&&candidate.retentionUntil<new Date());
 const commercialComplete=Boolean(candidate.availability&&(candidate.dailyRate!=null||candidate.salaryExpectation!=null));
 const prequalificationEligible=candidate.matches.some(m=>["SHORTLIST","CONTACTED","INTERVIEW"].includes(m.stage));
 return <>
  <div className="card"><div className="sectionHeader"><div><div className="eyebrow">CANDIDAT · V2.9</div><h1>{candidate.fullName}</h1><p className="muted">{candidate.location||"Localisation à confirmer"} · {candidate.email||"E-mail non détecté"} · {candidate.experienceYears?`${candidate.experienceYears} ans d'expérience détectés`:"Expérience à confirmer"}</p></div><div className="actions"><Link className="btn secondary" href="/actions">Centre d'actions</Link><Link className="btn secondary" href={`/search?q=${encodeURIComponent(candidate.fullName)}`}>Retrouver dans le vivier</Link><a className="btn secondary" href={`/api/candidates/${candidate.id}/export`}>Exporter les données</a>{candidate.filePathname&&<a className="btn secondary" href={`/api/candidates/${candidate.id}/file`}>Télécharger le CV</a>}<DeleteCandidateButton id={candidate.id} name={candidate.fullName}/></div></div>
   <div className="criteriaGrid"><div><strong>Origine</strong><p>{candidate.dataSource||"Non renseignée"}</p></div><div><strong>Conservation</strong><p className={expired?"warningText":""}>{candidate.retentionUntil?candidate.retentionUntil.toLocaleDateString("fr-FR"):"Non définie"}{expired?" · échéance dépassée":""}</p></div><div><strong>Fichier original</strong><p>{candidate.filePathname?`Stocké en privé · ${formatBytes(candidate.fileSize)}`:candidate.sourceFileName?"Non stocké durablement":"Import texte"}</p></div></div>
   <div className="criteriaGrid"><div><strong>Disponibilité</strong><p>{candidate.availability||"À confirmer"}</p></div><div><strong>TJM</strong><p>{candidate.dailyRate?`${candidate.dailyRate} € / jour`:"À confirmer"}</p></div><div><strong>Prétention salariale</strong><p>{candidate.salaryExpectation?`${candidate.salaryExpectation.toLocaleString("fr-FR")} € / an`:"À confirmer"}</p></div></div>
   <div className="opsPanel"><strong>{commercialComplete?"Disponibilité & rémunération complétées":prequalificationEligible?"Disponibilité & rémunération à compléter":"Préqualification non ouverte"}</strong><p className="muted">{prequalificationEligible?"Le candidat peut renseigner lui-même sa disponibilité et sa rémunération via un lien sécurisé, sans accès au back-office.":"Cette étape s’ouvre lorsque le recruteur décide réellement de poursuivre le candidat : Short-list, Contacté ou Entretien."}</p><CommercialPrequalButton candidateId={candidate.id} eligible={prequalificationEligible}/></div>
   {candidate.privacyNote&&<><h3>Note confidentialité</h3><p className="muted preline">{candidate.privacyNote}</p></>}
   <h3>Compétences positives détectées</h3><div>{skills.length?skills.map(x=><span className="pill" key={x}>{x}</span>):<span className="muted">Aucune compétence structurée détectée.</span>}</div>
   {negated.length>0&&<><h3 style={{marginTop:18}}>Mentions négatives ou limitées</h3><p className="warningText">{negated.join(", ")}</p></>}
   <h3 style={{marginTop:18}}>Extrait du CV</h3><p className="muted preline">{candidate.summary}</p>{candidate.sourceFileName&&<p className="small muted">Source importée : {candidate.sourceFileName}</p>}
  </div>
  <CandidateAiAnalysis candidateId={candidate.id}/>
  <div className="card" style={{marginTop:16}}><h2>Missions, suivi et relation candidat</h2>{candidate.matches.length===0?<p className="muted">Aucun matching calculé.</p>:candidate.matches.map(m=>{const activityData=m.activities.map(a=>({id:a.id,type:a.type,channel:a.channel,status:a.status,priority:a.priority,subject:a.subject,body:a.body,dueAt:a.dueAt?.toISOString()||null,completedAt:a.completedAt?.toISOString()||null,createdAt:a.createdAt.toISOString()}));const input={stage:m.stage,score:m.score,missing:m.missing||"",questions:m.questions||"",candidateInterest:m.candidateInterest||null,availability:candidate.availability||null,dailyRate:candidate.dailyRate||null,salaryExpectation:candidate.salaryExpectation||null,candidateName:candidate.fullName,candidateEmail:candidate.email||null,jobTitle:m.job.title,clientName:m.job.clientName||null};return <div className="matchRow" key={m.id}>
   <div className="sectionHeader"><div><Link href={`/jobs/${m.job.id}`}><strong>{m.job.title}</strong></Link><div className="muted small">{m.job.clientName||"Client non renseigné"} · {band(m.score)} · {stageLabel(m.stage)}</div></div><div className="scoreCompact">{m.score}/100</div></div>
   <p><strong>Correspondances :</strong> {m.matched||"—"}</p>{m.missing&&<p><strong>À vérifier :</strong> {m.missing}</p>}
   {m.questions&&<><strong>Questions suggérées</strong><ul>{m.questions.split("\n").filter(Boolean).map(q=><li key={q}>{q}</li>)}</ul>}
   <details className="opsDetails"><summary>Automatisation relationnelle</summary><RelationshipPanel matchId={m.id} candidateId={candidate.id} input={input} activities={activityData} templates={templates} recruiterName={user.fullName}/></details>
   <details className="opsDetails"><summary>Suivi recruteur et préqualification</summary><MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction} candidateInterest={m.candidateInterest}/><CandidateCommercial candidateId={candidate.id} availability={candidate.availability} dailyRate={candidate.dailyRate} salaryExpectation={candidate.salaryExpectation}/><CommercialPrequalButton candidateId={candidate.id} eligible={prequalificationEligible}/></details>
   <details className="opsDetails"><summary>Analyse détaillée</summary><p className="muted">{m.explanation}</p></details>
  </div>})}</div>
 </>;
}
