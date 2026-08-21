import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { hashClientShareToken } from "../../lib/clientShare";
import ClientFeedbackForm from "../../ClientFeedbackForm";

export const dynamic="force-dynamic";
const CLIENT_STAGES=["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"];
function list(v:string){return v.split(",").map(x=>x.trim()).filter(Boolean)}
function band(score:number){return score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente"}

export default async function PublicShare({params}:{params:Promise<{token:string}>}){
 const{token}=await params; const share=await prisma.clientShare.findUnique({where:{tokenHash:hashClientShareToken(token)},include:{organization:true,job:{include:{matches:{where:{stage:{in:CLIENT_STAGES}},include:{candidate:true},orderBy:{score:"desc"}}}}}});
 if(!share||!share.active||share.expiresAt<=new Date())notFound();
 await prisma.clientShare.update({where:{id:share.id},data:{lastViewedAt:new Date(),viewCount:{increment:1}}}).catch(()=>undefined);
 const job=share.job;
 return <div className="publicShare"><div className="card"><div className="eyebrow">SHORT-LIST CONFIDENTIELLE · V1.9</div><h1>{job.title}</h1><p className="muted">{job.clientName||"Client"} · {job.location||"Localisation à confirmer"}</p><p>{job.description}</p><p className="muted small">Partagé par {share.organization.name}. Lien valable jusqu'au {share.expiresAt.toLocaleDateString("fr-FR")}.</p></div>
  {job.matches.length===0?<div className="card" style={{marginTop:16}}>Aucun profil n'est actuellement disponible dans cette short-list.</div>:job.matches.map((m,index)=><section className="card clientCandidate" key={m.id} style={{marginTop:16}}><div className="sectionHeader"><div><div className="eyebrow">PROFIL {index+1}</div><h2>{m.candidate.fullName}</h2><p className="muted">{m.candidate.location||"Localisation à confirmer"} · {m.candidate.experienceYears?`${m.candidate.experienceYears} ans d'expérience détectés`:"Expérience à confirmer"}</p></div><div className="scoreCompact">{m.score}/100</div></div><p><strong>{band(m.score)}</strong></p>
   <div className="criteriaGrid"><div><strong>Disponibilité</strong><p>{m.candidate.availability||"À confirmer"}</p></div><div><strong>TJM</strong><p>{m.candidate.dailyRate?`${m.candidate.dailyRate} € / jour`:"À confirmer"}</p></div><div><strong>Prétention salariale</strong><p>{m.candidate.salaryExpectation?`${m.candidate.salaryExpectation.toLocaleString("fr-FR")} € / an`:"À confirmer"}</p></div></div>
   <h3>Forces par rapport à la mission</h3><ul>{list(m.matched).slice(0,12).map(x=><li key={x}>{x}</li>)}</ul>{m.missing&&<><h3>Points à valider</h3><ul>{list(m.missing).slice(0,8).map(x=><li key={x}>{x}</li>)}</ul></>}<h3>Synthèse</h3><p>{m.explanation}</p><details><summary>Donner un retour sur ce profil</summary><ClientFeedbackForm token={token} matchId={m.id}/></details></section>)}
  <p className="muted small" style={{marginTop:24}}>Les scores sont des aides à l'analyse. La décision de recrutement reste humaine. Les coordonnées privées et notes internes du recruteur ne sont pas partagées.</p></div>;
}
