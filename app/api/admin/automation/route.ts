import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

function safeWebhookUrl(value:string){
 try{
  const u=new URL(value);
  if(u.protocol!=="https:")return false;
  const h=u.hostname.toLowerCase();
  if(h==="localhost"||h==="127.0.0.1"||h==="::1"||h.endsWith(".local")||h.startsWith("10.")||h.startsWith("192.168."))return false;
  const m=h.match(/^172\.(\d+)\./);if(m&&Number(m[1])>=16&&Number(m[1])<=31)return false;
  return true;
 }catch{return false}
}

export async function POST(req:Request){
 const user=await apiUser();
 if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 if(user.role!=="ADMIN")return NextResponse.json({error:"Accès administrateur requis"},{status:403});
 const body=await req.json().catch(()=>({}));
 const op=String(body.op||"");
 try{
  if(op==="sla"){
   const candidate=Math.max(1,Math.min(720,Number(body.candidateResponseSlaHours)||24));
   const interview=Math.max(1,Math.min(720,Number(body.interviewFollowupSlaHours)||48));
   const client=Math.max(1,Math.min(720,Number(body.clientFeedbackSlaHours)||72));
   const organization=await prisma.organization.update({where:{id:user.organizationId},data:{candidateResponseSlaHours:candidate,interviewFollowupSlaHours:interview,clientFeedbackSlaHours:client}});
   await audit({organizationId:user.organizationId,userId:user.id,action:"AUTOMATION_SLA_UPDATED",entityType:"Organization",entityId:user.organizationId,details:`candidate=${candidate}h; interview=${interview}h; client=${client}h`});
   return NextResponse.json(organization);
  }
  if(op==="template"){
   const type=String(body.type||"").trim().toUpperCase();
   const allowed=new Set(["RECEIPT","CONTACT","FOLLOW_UP","INTERVIEW","POST_INTERVIEW"]);
   if(!allowed.has(type))return NextResponse.json({error:"Type de modèle invalide"},{status:400});
   const name=String(body.name||type).trim().slice(0,100);
   const subject=String(body.subject||"").trim().slice(0,300);
   const text=String(body.body||"").trim().slice(0,12000);
   if(!text)return NextResponse.json({error:"Le contenu du modèle est requis"},{status:400});
   const template=await prisma.messageTemplate.upsert({where:{organizationId_type:{organizationId:user.organizationId,type}},update:{name,subject,body:text,active:body.active!==false},create:{organizationId:user.organizationId,type,name,subject,body:text,active:true}});
   await audit({organizationId:user.organizationId,userId:user.id,action:"MESSAGE_TEMPLATE_SAVED",entityType:"MessageTemplate",entityId:template.id,details:type});
   return NextResponse.json(template);
  }
  if(op==="webhook_create"){
   const name=String(body.name||"Connecteur").trim().slice(0,100);
   const url=String(body.url||"").trim();
   const events=String(body.events||"candidate.activity.validated").trim().slice(0,500);
   if(!safeWebhookUrl(url))return NextResponse.json({error:"URL HTTPS publique requise"},{status:400});
   const endpoint=await prisma.webhookEndpoint.create({data:{organizationId:user.organizationId,name,url,events,active:true}});
   await audit({organizationId:user.organizationId,userId:user.id,action:"WEBHOOK_CREATED",entityType:"WebhookEndpoint",entityId:endpoint.id,details:name});
   return NextResponse.json(endpoint);
  }
  if(op==="webhook_toggle"){
   const id=String(body.id||"");
   const existing=await prisma.webhookEndpoint.findFirst({where:{id,organizationId:user.organizationId}});
   if(!existing)return NextResponse.json({error:"Connecteur introuvable"},{status:404});
   const endpoint=await prisma.webhookEndpoint.update({where:{id},data:{active:!existing.active}});
   await audit({organizationId:user.organizationId,userId:user.id,action:"WEBHOOK_TOGGLED",entityType:"WebhookEndpoint",entityId:id,details:`active=${endpoint.active}`});
   return NextResponse.json(endpoint);
  }
  if(op==="webhook_delete"){
   const id=String(body.id||"");
   const existing=await prisma.webhookEndpoint.findFirst({where:{id,organizationId:user.organizationId}});
   if(!existing)return NextResponse.json({error:"Connecteur introuvable"},{status:404});
   await prisma.webhookEndpoint.delete({where:{id}});
   await audit({organizationId:user.organizationId,userId:user.id,action:"WEBHOOK_DELETED",entityType:"WebhookEndpoint",entityId:id,details:existing.name});
   return NextResponse.json({ok:true});
  }
  return NextResponse.json({error:"Opération inconnue"},{status:400});
 }catch(error){console.error(error);return NextResponse.json({error:"Configuration impossible"},{status:500})}
}
