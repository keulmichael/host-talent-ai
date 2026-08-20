import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { detectNegatedSkills, detectSkills } from "../../lib/extract";
import { stageLabel } from "../../lib/pipeline";
import { requireUser } from "../../lib/auth";
import MatchActions from "../../MatchActions";
import DeleteCandidateButton from "../../DeleteCandidateButton";

export const dynamic = "force-dynamic";
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}

export default async function CandidateDetail({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const candidate=await prisma.candidate.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{job:true},orderBy:{score:"desc"}}}});if(!candidate)notFound();
 const skills=detectSkills(candidate.rawText),negated=detectNegatedSkills(candidate.rawText);
 return <>
  <div className="card"><div className="sectionHeader"><div><div className="eyebrow">CANDIDAT · DONNÉES PERSONNELLES</div><h1>{candidate.fullName}</h1><p className="muted">{candidate.location||"Localisation à confirmer"} · {candidate.email||"E-mail non détecté"} · {candidate.experienceYears?`${candidate.experienceYears} ans d'expérience détectés`:"Expérience à confirmer"}</p></div><div className="actions"><Link className="btn secondary" href={`/search?q=${encodeURIComponent(candidate.fullName)}`}>Retrouver dans le vivier</Link><DeleteCandidateButton id={candidate.id} name={candidate.fullName}/></div></div>
   <h3>Compétences positives détectées</h3><div>{skills.length?skills.map(x=><span className="pill" key={x}>{x}</span>):<span className="muted">Aucune compétence structurée détectée.</span>}</div>
   {negated.length>0&&<><h3 style={{marginTop:18}}>Mentions négatives ou limitées</h3><p className="warningText">{negated.join(", ")}</p></>}
   <h3 style={{marginTop:18}}>Extrait du CV</h3><p className="muted preline">{candidate.summary}</p>{candidate.sourceFileName&&<p className="small muted">Source importée : {candidate.sourceFileName}</p>}
  </div>
  <div className="card" style={{marginTop:16}}><h2>Missions et suivi</h2>{candidate.matches.length===0?<p className="muted">Aucun matching calculé.</p>:candidate.matches.map(m=><div className="matchRow" key={m.id}>
   <div className="sectionHeader"><div><Link href={`/jobs/${m.job.id}`}><strong>{m.job.title}</strong></Link><div className="muted small">{m.job.clientName||"Client non renseigné"} · {band(m.score)} · {stageLabel(m.stage)}</div></div><div className="scoreCompact">{m.score}/100</div></div>
   <p><strong>Correspondances :</strong> {m.matched||"—"}</p><p><strong>À vérifier :</strong> {m.missing||"—"}</p><p className="muted">{m.explanation}</p>
   {m.questions&&<><strong>Questions suggérées</strong><ul>{m.questions.split("\n").filter(Boolean).map(q=><li key={q}>{q}</li>)}</ul></>}
   <MatchActions id={m.id} stage={m.stage} recruiterNote={m.recruiterNote} nextAction={m.nextAction}/>
  </div>)}</div>
 </>;
}
