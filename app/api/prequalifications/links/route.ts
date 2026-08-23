import {NextResponse} from "next/server";
import {apiUser} from "../../../lib/auth";
import {prisma} from "../../../lib/db";
import crypto from "crypto";

export async function POST(req:Request){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const body=await req.json();const ids=Array.isArray(body.candidateIds)?[...new Set(body.candidateIds.map(String))].slice(0,200):[];
 if(!ids.length)return NextResponse.json({error:"Aucun candidat sélectionné"},{status:400});
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId,id:{in:ids}},select:{id:true,fullName:true}});
 const secret=process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||"";if(!secret)return NextResponse.json({error:"Secret serveur manquant"},{status:500});
 const origin=new URL(req.url).origin;
 const existing=await prisma.candidateActivity.findMany({where:{organizationId:user.organizationId,candidateId:{in:candidates.map(c=>c.id)},type:"PREQUALIFICATION_LINK",status:"PLANNED"},select:{candidateId:true}});
 const already=new Set(existing.map(a=>a.candidateId));
 const toCreate=candidates.filter(c=>!already.has(c.id));
 if(toCreate.length)await prisma.candidateActivity.createMany({data:toCreate.map(c=>({organizationId:user.organizationId,candidateId:c.id,createdById:user.id,type:"PREQUALIFICATION_LINK",channel:"LINK",status:"PLANNED",priority:"NORMAL",subject:"Lien de préqualification commerciale généré"}))});
 const links=candidates.map(c=>{const sig=crypto.createHmac("sha256",secret).update(c.id).digest("hex").slice(0,32);return {candidateId:c.id,fullName:c.fullName,url:`${origin}/prequalification/${c.id}.${sig}`};});
 return NextResponse.json({links});
}