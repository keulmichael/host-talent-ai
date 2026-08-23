import {requireUser} from "../lib/auth";
import {prisma} from "../lib/db";
import {classifyMatch} from "../lib/matchPriority";
import PrequalificationQueue from "./PrequalificationQueue";
export const dynamic="force-dynamic";

export default async function PrequalificationsPage(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},select:{id:true,fullName:true,email:true,availability:true,dailyRate:true,salaryExpectation:true,activities:{where:{type:"PREQUALIFICATION_LINK"},orderBy:{createdAt:"desc"},take:1,select:{status:true}},matches:{where:{organizationId:user.organizationId,stage:"NEW"},select:{score:true,missing:true,questions:true,job:{select:{title:true,mustHave:true,shouldHave:true}}}}}});
 const items=candidates.map(c=>{
  let best:null|{score:number;jobTitle:string}=null;
  for(const m of c.matches){const p=classifyMatch({...m,mustHave:m.job.mustHave,shouldHave:m.job.shouldHave,availability:c.availability,dailyRate:c.dailyRate,salaryExpectation:c.salaryExpectation});if(!p.isPriority)continue;if(!best||m.score>best.score)best={score:m.score,jobTitle:m.job.title};}
  if(!best)return null;
  const complete=Boolean(c.availability&&(c.dailyRate!=null||c.salaryExpectation!=null));
  const last=c.activities[0]?.status;
  const status=complete?"COMPLETED":last==="PLANNED"?"LINK_CREATED":"TO_CONTACT";
  return {id:c.id,fullName:c.fullName,email:c.email,score:best.score,jobTitle:best.jobTitle,status,availability:c.availability,dailyRate:c.dailyRate,salaryExpectation:c.salaryExpectation};
 }).filter(Boolean) as Array<{id:string;fullName:string;email:string|null;score:number;jobTitle:string;status:"TO_CONTACT"|"LINK_CREATED"|"COMPLETED";availability:string|null;dailyRate:number|null;salaryExpectation:number|null}>;
 items.sort((a,b)=>a.status===b.status?b.score-a.score:a.status==="TO_CONTACT"?-1:b.status==="TO_CONTACT"?1:a.status==="LINK_CREATED"?-1:1);
 const toContact=items.filter(i=>i.status==="TO_CONTACT").length,generated=items.filter(i=>i.status==="LINK_CREATED").length,completed=items.filter(i=>i.status==="COMPLETED").length;
 return <><section className="dashboardHero"><div><div className="eyebrow">V2.7 · COMPLÉTER</div><h1>Préqualification commerciale</h1><p className="muted">Transformez les informations commerciales manquantes en file d’action : solliciter les candidats, suivre les liens générés et récupérer automatiquement disponibilité et rémunération.</p></div></section><section className="kpiRow"><div className="kpiCard"><span>À solliciter</span><strong>{toContact}</strong><small>aucun lien généré</small></div><div className="kpiCard"><span>Lien généré</span><strong>{generated}</strong><small>en attente de réponse</small></div><div className="kpiCard"><span>Complété</span><strong>{completed}</strong><small>informations reçues</small></div><div className="kpiCard"><span>Candidats prioritaires</span><strong>{items.length}</strong><small>meilleur matching ≥ 75</small></div></section><PrequalificationQueue items={items}/></>;
}