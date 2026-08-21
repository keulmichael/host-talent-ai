import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import ClientShareManager from "../../../ClientShareManager";

export const dynamic="force-dynamic";
const labels:Record<string,string>={INTERESTED:"Intéressé",INTERVIEW:"Souhaite un entretien",HOLD:"À garder",REJECTED:"Ne pas poursuivre"};

export default async function SharesPage({params}:{params:Promise<{id:string}>}){
 const user=await requireUser(); const{id}=await params;
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{clientShares:{where:{organizationId:user.organizationId},orderBy:{createdAt:"desc"},include:{feedbacks:{orderBy:{createdAt:"desc"},include:{match:{include:{candidate:true}}}}}}}});
 if(!job)notFound(); const feedbacks=job.clientShares.flatMap(s=>s.feedbacks.map(f=>({...f,shareLabel:s.label})));
 return <><div className="card"><div className="sectionHeader"><div><div className="eyebrow">V1.9 · PORTAIL CLIENT</div><h1>Partages et retours client</h1><p className="muted">{job.title} · {job.clientName||"Client non renseigné"}</p></div><div className="actions"><Link className="btn secondary" href={`/jobs/${job.id}`}>Retour mission</Link><Link className="btn secondary" href={`/jobs/${job.id}/client`}>Dossier client</Link></div></div><ClientShareManager jobId={job.id}/></div>
 <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Retours reçus</h2><p className="muted">{feedbacks.length} retour(s) enregistrés.</p></div></div>{feedbacks.length===0?<p className="muted">Aucun retour client pour le moment.</p>:feedbacks.map(f=><div className="matchRow" key={f.id}><div className="sectionHeader"><div><strong>{f.match.candidate.fullName}</strong><div className="muted small">{f.clientName||"Client anonyme"} · {new Date(f.createdAt).toLocaleString("fr-FR")} · {f.shareLabel||"Partage client"}</div></div><span className="pill">{labels[f.decision]||f.decision}</span></div>{f.comment&&<p>{f.comment}</p>}</div>)}</div></>;
}
