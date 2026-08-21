import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const{id}=await params; const body=await req.json();
 const existing=await prisma.candidate.findFirst({where:{id,organizationId:user.organizationId}});
 if(!existing)return NextResponse.json({error:"Candidat introuvable"},{status:404});
 const dailyRate=body.dailyRate==null?null:Number(body.dailyRate); const salaryExpectation=body.salaryExpectation==null?null:Number(body.salaryExpectation);
 if(dailyRate!=null&&(!Number.isFinite(dailyRate)||dailyRate<0))return NextResponse.json({error:"TJM invalide"},{status:400});
 if(salaryExpectation!=null&&(!Number.isFinite(salaryExpectation)||salaryExpectation<0))return NextResponse.json({error:"Prétention salariale invalide"},{status:400});
 const candidate=await prisma.candidate.update({where:{id},data:{availability:String(body.availability||"").trim().slice(0,120)||null,dailyRate:dailyRate==null?null:Math.round(dailyRate),salaryExpectation:salaryExpectation==null?null:Math.round(salaryExpectation)}});
 await audit({organizationId:user.organizationId,userId:user.id,action:"CANDIDATE_COMMERCIAL_UPDATED",entityType:"Candidate",entityId:id,details:`availability=${candidate.availability||""}; tjm=${candidate.dailyRate||""}; salary=${candidate.salaryExpectation||""}`}).catch(()=>undefined);
 return NextResponse.json(candidate);
}
