import {NextResponse} from "next/server";
import {prisma} from "../../../lib/db";
import {candidateIdFromPrequalificationToken} from "../../../lib/prequalificationToken";

export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;const id=candidateIdFromPrequalificationToken(token);if(!id)return NextResponse.json({error:"Lien invalide"},{status:404});
 const c=await prisma.candidate.findUnique({where:{id},select:{fullName:true,availability:true,dailyRate:true,salaryExpectation:true}});
 if(!c)return NextResponse.json({error:"Candidat introuvable"},{status:404});return NextResponse.json(c);
}
export async function PATCH(req:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;const id=candidateIdFromPrequalificationToken(token);if(!id)return NextResponse.json({error:"Lien invalide"},{status:404});
 const current=await prisma.candidate.findUnique({where:{id},select:{organizationId:true}});if(!current)return NextResponse.json({error:"Candidat introuvable"},{status:404});
 const body=await req.json();const dailyRate=body.dailyRate?Number(body.dailyRate):null;const salaryExpectation=body.salaryExpectation?Number(body.salaryExpectation):null;
 if(dailyRate!=null&&(!Number.isFinite(dailyRate)||dailyRate<0))return NextResponse.json({error:"TJM invalide"},{status:400});
 if(salaryExpectation!=null&&(!Number.isFinite(salaryExpectation)||salaryExpectation<0))return NextResponse.json({error:"Salaire invalide"},{status:400});
 const availability=String(body.availability||"").trim().slice(0,120)||null;
 await prisma.$transaction([
  prisma.candidate.update({where:{id},data:{availability,dailyRate:dailyRate==null?null:Math.round(dailyRate),salaryExpectation:salaryExpectation==null?null:Math.round(salaryExpectation)}}),
  prisma.candidateActivity.updateMany({where:{organizationId:current.organizationId,candidateId:id,type:"PREQUALIFICATION_LINK",status:"PLANNED"},data:{status:"DONE",completedAt:new Date()}})
 ]);
 return NextResponse.json({ok:true});
}
