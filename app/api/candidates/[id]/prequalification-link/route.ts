import {NextResponse} from "next/server";
import {apiUser} from "../../../../lib/auth";
import {prisma} from "../../../../lib/db";
import crypto from "crypto";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const {id}=await params;
 const candidate=await prisma.candidate.findFirst({where:{id,organizationId:user.organizationId},select:{id:true}});
 if(!candidate)return NextResponse.json({error:"Candidat introuvable"},{status:404});
 const secret=process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||"";
 if(!secret)return NextResponse.json({error:"Secret serveur manquant"},{status:500});
 const sig=crypto.createHmac("sha256",secret).update(id).digest("hex").slice(0,32);
 const origin=new URL(req.url).origin;
 const existing=await prisma.candidateActivity.findFirst({where:{organizationId:user.organizationId,candidateId:id,type:"PREQUALIFICATION_LINK",status:"PLANNED"}});
 if(!existing)await prisma.candidateActivity.create({data:{organizationId:user.organizationId,candidateId:id,createdById:user.id,type:"PREQUALIFICATION_LINK",channel:"LINK",status:"PLANNED",priority:"NORMAL",subject:"Lien de préqualification commerciale généré"}});
 return NextResponse.json({url:`${origin}/prequalification/${id}.${sig}`});
}