import {NextResponse} from "next/server";
import {prisma} from "../../../../lib/db";
import {apiUser,audit} from "../../../../lib/auth";

export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const{id}=await params;
 const activity=await prisma.candidateActivity.findFirst({where:{id,organizationId:user.organizationId},include:{candidate:true,match:{include:{job:true}}}});
 if(!activity)return NextResponse.json({error:"Action introuvable"},{status:404});
 const endpoints=await prisma.webhookEndpoint.findMany({where:{organizationId:user.organizationId,active:true}});
 if(!endpoints.length)return NextResponse.json({error:"Aucun connecteur actif. Configure-le dans Administration > Automatisation."},{status:400});
 const event="candidate.activity.validated";
 const payload={event,occurredAt:new Date().toISOString(),organizationId:user.organizationId,activity:{id:activity.id,type:activity.type,channel:activity.channel,status:activity.status,priority:activity.priority,subject:activity.subject,body:activity.body,dueAt:activity.dueAt?.toISOString()||null},candidate:{id:activity.candidate.id,fullName:activity.candidate.fullName,email:activity.candidate.email},mission:activity.match?{id:activity.match.job.id,title:activity.match.job.title,clientName:activity.match.job.clientName,score:activity.match.score,stage:activity.match.stage}:null};
 const selected=endpoints.filter(e=>e.events.split(/[,;\n]/).map(x=>x.trim()).includes(event)||e.events.includes("*"));
 if(!selected.length)return NextResponse.json({error:`Aucun connecteur n'écoute ${event}`},{status:400});
 const results=[] as {id:string;name:string;ok:boolean;status?:number;error?:string}[];
 for(const endpoint of selected){
  try{
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
   const res=await fetch(endpoint.url,{method:"POST",headers:{"Content-Type":"application/json","User-Agent":"Host-Talent-AI/2.2"},body:JSON.stringify(payload),signal:controller.signal,cache:"no-store"});clearTimeout(timer);
   results.push({id:endpoint.id,name:endpoint.name,ok:res.ok,status:res.status});
  }catch(e){results.push({id:endpoint.id,name:endpoint.name,ok:false,error:e instanceof Error?e.message:"Erreur réseau"});}
 }
 await audit({organizationId:user.organizationId,userId:user.id,action:"ACTIVITY_WEBHOOK_DISPATCHED",entityType:"CandidateActivity",entityId:id,details:results.map(r=>`${r.name}:${r.ok?"ok":r.status||r.error}`).join("; ")});
 return NextResponse.json({ok:results.some(r=>r.ok),event,results},{status:results.some(r=>r.ok)?200:502});
}
