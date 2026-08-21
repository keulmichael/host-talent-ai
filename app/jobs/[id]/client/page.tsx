import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import PrintButton from "../../../PrintButton";

export const dynamic="force-dynamic";
const CLIENT_STAGES=["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"];
function list(v:string){return v.split(",").map(x=>x.trim()).filter(Boolean)}
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}

export default async function ClientPack({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId,stage:{in:CLIENT_STAGES}},include:{candidate:true},orderBy:{score:"desc"}}}});
 if(!job)notFound();
 return <>
  <div className="card noPrint"><div className="sectionHeader"><div><div className="eyebrow">V1.8 · DOSSIER CLIENT</div><h1>Short-list client</h1><p className="muted">Seuls les profils ayant quitté l'étape « À examiner » et retenus dans le processus sont présentés.</p></div><div className="actions"><Link className="btn secondary" href={`/jobs/${job.id}`}>Retour mission</Link><Link className="btn secondary" href={`/jobs/${job.id}/compare`}>Comparer</Link><PrintButton/></div></div></div>
  <div className="card printDocument" style={{marginTop:16}}>
   <div className="eyebrow">PRÉSENTATION DE CANDIDATS</div><h1>{job.title}</h1><p className="muted">{job.clientName||"Client"} · {job.location||"Localisation à confirmer"}</p>
   <p>{job.description}</p><hr/>
   {job.matches.length===0?<p>Aucun candidat n'est encore placé en short-list. Depuis la mission, passe un profil à l'étape « Short-list » pour l'ajouter ici.</p>:job.matches.map((m,index)=><section className="clientCandidate" key={m.id} style={{marginTop:28}}>
    <div className="sectionHeader"><div><div className="eyebrow">PROFIL {index+1}</div><h2>{m.candidate.fullName}</h2><p className="muted">{m.candidate.location||"Localisation à confirmer"} · {m.candidate.experienceYears?`${m.candidate.experienceYears} ans d'expérience détectés`:"Expérience à confirmer"}</p></div><div className="scoreCompact">{m.score}/100</div></div>
    <p><strong>{band(m.score)}</strong></p>
    <h3>Forces par rapport à la mission</h3><ul>{list(m.matched).slice(0,12).map(x=><li key={x}>{x}</li>)}</ul>
    {m.missing&&<><h3>Points à valider avant décision</h3><ul>{list(m.missing).slice(0,8).map(x=><li key={x}>{x}</li>)}</ul></>}
    <h3>Synthèse</h3><p>{m.explanation}</p>
   </section>)}
   <p className="muted small" style={{marginTop:32}}>Document préparé par {user.organization.name}. Les scores sont des aides à l'analyse et ne constituent pas une décision automatisée de recrutement.</p>
  </div>
 </>;
}
