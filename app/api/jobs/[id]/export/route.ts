import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";
import { stageLabel } from "../../../../lib/pipeline";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();
 if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const{id}=await params;
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{organizationId:user.organizationId},include:{candidate:true},orderBy:{score:"desc"}}}});
 if(!job)return NextResponse.json({error:"Mission introuvable"},{status:404});
 const payload={
  schema:"host-talent-ai/job-export/v1",
  exportedAt:new Date().toISOString(),
  organization:{id:user.organizationId,name:user.organization.name},
  job:{id:job.id,title:job.title,clientName:job.clientName,location:job.location,description:job.description,mustHave:job.mustHave,shouldHave:job.shouldHave,optional:job.optional},
  candidates:job.matches.map(m=>({
   candidateId:m.candidate.id,fullName:m.candidate.fullName,email:m.candidate.email,location:m.candidate.location,experienceYears:m.candidate.experienceYears,skills:m.candidate.skills.split(",").map(x=>x.trim()).filter(Boolean),
   match:{score:m.score,stage:m.stage,stageLabel:stageLabel(m.stage),matched:m.matched.split(",").map(x=>x.trim()).filter(Boolean),missing:m.missing.split(",").map(x=>x.trim()).filter(Boolean),explanation:m.explanation,recruiterNote:m.recruiterNote,nextAction:m.nextAction}
  }))
 };
 await audit({organizationId:user.organizationId,userId:user.id,action:"JOB_ATS_EXPORT",entityType:"Job",entityId:job.id,details:`${job.title} · ${job.matches.length} profils`}).catch(()=>undefined);
 return NextResponse.json(payload,{headers:{"Content-Disposition":`attachment; filename="host-talent-${job.id}.json"`,"Cache-Control":"private, no-store"}});
}
