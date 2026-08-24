import {requireUser} from "../lib/auth";
import {prisma} from "../lib/db";
import PrequalificationQueue from "./PrequalificationQueue";
export const dynamic="force-dynamic";

const ELIGIBLE_STAGES=["SHORTLIST","CONTACTED","INTERVIEW"];

export default async function PrequalificationsPage(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId,matches:{some:{organizationId:user.organizationId,stage:{in:ELIGIBLE_STAGES}}}},select:{id:true,fullName:true,email:true,availability:true,dailyRate:true,salaryExpectation:true,activities:{where:{type:"PREQUALIFICATION_LINK"},orderBy:{createdAt:"desc"},take:1,select:{status:true}},matches:{where:{organizationId:user.organizationId,stage:{in:ELIGIBLE_STAGES}},orderBy:{score:"desc"},take:1,select:{score:true,job:{select:{title:true}}}}}});
 const items=candidates.map(c=>{
  const best=c.matches[0];if(!best)return null;
  const complete=Boolean(c.availability&&(c.dailyRate!=null||c.salaryExpectation!=null));
  const last=c.activities[0]?.status;
  const status=complete?"COMPLETED":last==="PLANNED"?"LINK_CREATED":"TO_CONTACT";
  return {id:c.id,fullName:c.fullName,email:c.email,score:best.score,jobTitle:best.job.title,status,availability:c.availability,dailyRate:c.dailyRate,salaryExpectation:c.salaryExpectation};
 }).filter(Boolean) as Array<{id:string;fullName:string;email:string|null;score:number;jobTitle:string;status:"TO_CONTACT"|"LINK_CREATED"|"COMPLETED";availability:string|null;dailyRate:number|null;salaryExpectation:number|null}>;
 items.sort((a,b)=>a.status===b.status?b.score-a.score:a.status==="TO_CONTACT"?-1:b.status==="TO_CONTACT"?1:a.status==="LINK_CREATED"?-1:1);
 const toContact=items.filter(i=>i.status==="TO_CONTACT").length,generated=items.filter(i=>i.status==="LINK_CREATED").length,completed=items.filter(i=>i.status==="COMPLETED").length;
 return <><section className="dashboardHero"><div><div className="eyebrow">V2.7 · COMPLÉTER</div><h1>Disponibilité & rémunération</h1><p className="muted">Cette file ne contient que les candidats déjà retenus par le recruteur : short-list, contactés ou en entretien. Recueillez leur disponibilité et, selon le type de poste, leur TJM ou leur prétention salariale.</p></div></section><section className="kpiRow"><div className="kpiCard"><span>À solliciter</span><strong>{toContact}</strong><small>candidats retenus sans lien généré</small></div><div className="kpiCard"><span>Lien généré</span><strong>{generated}</strong><small>en attente de réponse</small></div><div className="kpiCard"><span>Complété</span><strong>{completed}</strong><small>disponibilité & rémunération reçues</small></div><div className="kpiCard"><span>À préqualifier</span><strong>{items.length}</strong><small>short-list, contactés ou entretiens</small></div></section><PrequalificationQueue items={items}/></>;
}
