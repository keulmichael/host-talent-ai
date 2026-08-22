import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { hashCandidateSurveyToken } from "../../../../lib/candidateExperience";

function bounded(value:unknown,min:number,max:number){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):null;}

export async function POST(req:Request,{params}:{params:Promise<{token:string}>}){
 try{
  const{token}=await params; const body=await req.json().catch(()=>({}));
  const survey=await prisma.candidateSurvey.findUnique({where:{tokenHash:hashCandidateSurveyToken(token)},include:{response:true}});
  if(!survey||!survey.active||survey.expiresAt<new Date())return NextResponse.json({error:"Lien invalide ou expiré"},{status:404});
  if(survey.response)return NextResponse.json({error:"Une réponse a déjà été enregistrée"},{status:409});
  const clarity=bounded(body.clarity,1,5),responsiveness=bounded(body.responsiveness,1,5),respect=bounded(body.respect,1,5),transparency=bounded(body.transparency,1,5),recommendation=bounded(body.recommendation,0,10);
  if([clarity,responsiveness,respect,transparency,recommendation].some(v=>v===null))return NextResponse.json({error:"Réponse incomplète"},{status:400});
  const response=await prisma.candidateSurveyResponse.create({data:{surveyId:survey.id,clarity:clarity!,responsiveness:responsiveness!,respect:respect!,transparency:transparency!,recommendation:recommendation!,comment:String(body.comment||"").trim().slice(0,2000)||null}});
  await prisma.candidateSurvey.update({where:{id:survey.id},data:{active:false}});
  return NextResponse.json({ok:true,id:response.id});
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible d'enregistrer votre retour"},{status:500});}
}
