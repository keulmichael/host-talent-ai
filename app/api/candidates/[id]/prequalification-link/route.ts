import {NextResponse} from "next/server";
import {apiUser} from "../../../../lib/auth";
import {prisma} from "../../../../lib/db";
import {createPrequalificationToken} from "../../../../lib/prequalificationToken";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const {id}=await params;
 const candidate=await prisma.candidate.findFirst({where:{id,organizationId:user.organizationId,matches:{some:{organizationId:user.organizationId,stage:{in:["SHORTLIST","CONTACTED","INTERVIEW"]}}}},select:{id:true}});
 if(!candidate)return NextResponse.json({error:"Le candidat doit être en short-list, contacté ou en entretien avant la préqualification"},{status:400});
 const token=createPrequalificationToken(id);if(!token)return NextResponse.json({error:"Impossible de sécuriser le lien"},{status:500});
 const origin=new URL(req.url).origin;
 const existing=await prisma.candidateActivity.findFirst({where:{organizationId:user.organizationId,candidateId:id,type:"PREQUALIFICATION_LINK",status:"PLANNED"}});
 if(!existing)await prisma.candidateActivity.create({data:{organizationId:user.organizationId,candidateId:id,createdById:user.id,type:"PREQUALIFICATION_LINK",channel:"LINK",status:"PLANNED",priority:"NORMAL",subject:"Lien disponibilité & rémunération généré"}});
 return NextResponse.json({url:`${origin}/prequalification/${token}`});
}
