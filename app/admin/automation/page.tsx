import {requireAdmin} from "../../lib/auth";
import {prisma} from "../../lib/db";
import AutomationSettings from "./AutomationSettings";

export const dynamic="force-dynamic";

export default async function AutomationAdminPage(){
 const user=await requireAdmin();
 const [organization,templates,webhooks]=await Promise.all([
  prisma.organization.findUnique({where:{id:user.organizationId}}),
  prisma.messageTemplate.findMany({where:{organizationId:user.organizationId},orderBy:{type:"asc"}}),
  prisma.webhookEndpoint.findMany({where:{organizationId:user.organizationId},orderBy:{createdAt:"desc"}})
 ]);
 if(!organization)return null;
 return <><div className="hero"><div><div className="eyebrow">V2.2 · AUTOMATISATION RELATIONNELLE</div><h1>Orchestration cabinet</h1><p className="muted">Modèles personnalisés, SLA relationnels et connecteurs universels sans imposer un outil de messagerie.</p></div></div><AutomationSettings sla={{candidate:organization.candidateResponseSlaHours,interview:organization.interviewFollowupSlaHours,client:organization.clientFeedbackSlaHours}} templates={templates} webhooks={webhooks}/></>;
}
