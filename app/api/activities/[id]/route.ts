import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

const allowedStatuses=new Set(["PLANNED","DONE","CANCELLED"]);

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
  const{id}=await params; const body=await req.json(); const status=String(body.status||"");
  if(!allowedStatuses.has(status))return NextResponse.json({error:"Statut invalide"},{status:400});
  const existing=await prisma.candidateActivity.findFirst({where:{id,organizationId:user.organizationId}});if(!existing)return NextResponse.json({error:"Activité introuvable"},{status:404});
  const activity=await prisma.candidateActivity.update({where:{id},data:{status,completedAt:status==="DONE"?new Date():null}});
  await audit({organizationId:user.organizationId,userId:user.id,action:"CANDIDATE_ACTIVITY_UPDATED",entityType:"CandidateActivity",entityId:id,details:`status=${status}`});
  return NextResponse.json(activity);
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible de mettre à jour l'activité"},{status:500});}
}
