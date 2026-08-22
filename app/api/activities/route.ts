import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { apiUser, audit } from "../../lib/auth";

const allowedTypes=new Set(["RECEIPT","CONTACT","FOLLOW_UP","INTERVIEW","POST_INTERVIEW","NOTE"]);
const allowedChannels=new Set(["EMAIL","PHONE","MEETING","OTHER"]);
const allowedStatuses=new Set(["PLANNED","DONE","CANCELLED"]);
const allowedPriorities=new Set(["HIGH","NORMAL","LOW"]);

export async function POST(req:Request){
 try{
  const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
  const body=await req.json();
  const candidateId=String(body.candidateId||""); const matchId=body.matchId?String(body.matchId):null;
  const type=String(body.type||"NOTE"); const channel=String(body.channel||"EMAIL"); const status=String(body.status||"PLANNED"); const priority=String(body.priority||"NORMAL");
  if(!candidateId)return NextResponse.json({error:"Candidat requis"},{status:400});
  if(!allowedTypes.has(type)||!allowedChannels.has(channel)||!allowedStatuses.has(status)||!allowedPriorities.has(priority))return NextResponse.json({error:"Paramètres d'activité invalides"},{status:400});
  const candidate=await prisma.candidate.findFirst({where:{id:candidateId,organizationId:user.organizationId}}); if(!candidate)return NextResponse.json({error:"Candidat introuvable"},{status:404});
  if(matchId){const match=await prisma.match.findFirst({where:{id:matchId,organizationId:user.organizationId,candidateId}});if(!match)return NextResponse.json({error:"Matching introuvable"},{status:404});}
  const dueAt=body.dueAt?new Date(String(body.dueAt)):null;if(dueAt&&Number.isNaN(dueAt.getTime()))return NextResponse.json({error:"Échéance invalide"},{status:400});
  const activity=await prisma.candidateActivity.create({data:{organizationId:user.organizationId,candidateId,matchId,createdById:user.id,type,channel,status,priority,subject:String(body.subject||"").trim().slice(0,240)||null,body:String(body.body||"").trim().slice(0,8000)||null,dueAt,completedAt:status==="DONE"?new Date():null}});
  await audit({organizationId:user.organizationId,userId:user.id,action:"CANDIDATE_ACTIVITY_CREATED",entityType:"CandidateActivity",entityId:activity.id,details:`type=${type}; channel=${channel}; status=${status}`});
  return NextResponse.json(activity);
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible d'enregistrer l'interaction"},{status:500});}
}
