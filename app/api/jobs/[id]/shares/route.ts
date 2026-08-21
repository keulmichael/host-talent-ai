import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";
import { createClientShareToken, hashClientShareToken, shareExpiry } from "../../../../lib/clientShare";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401}); const{id}=await params;
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId}}); if(!job)return NextResponse.json({error:"Mission introuvable"},{status:404});
 const shares=await prisma.clientShare.findMany({where:{jobId:id,organizationId:user.organizationId},orderBy:{createdAt:"desc"},include:{feedbacks:true}});
 return NextResponse.json(shares.map(s=>({id:s.id,label:s.label,expiresAt:s.expiresAt,active:s.active,createdAt:s.createdAt,lastViewedAt:s.lastViewedAt,viewCount:s.viewCount,feedbackCount:s.feedbacks.length})));
}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401}); const{id}=await params; const body=await req.json().catch(()=>({}));
 const job=await prisma.job.findFirst({where:{id,organizationId:user.organizationId},include:{matches:{where:{stage:{in:["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"]}},select:{id:true}}}});
 if(!job)return NextResponse.json({error:"Mission introuvable"},{status:404}); if(job.matches.length===0)return NextResponse.json({error:"Ajoute au moins un candidat à la short-list avant de créer un partage."},{status:400});
 const days=Math.min(30,Math.max(1,Number(body.days)||14)); const token=createClientShareToken(); const share=await prisma.clientShare.create({data:{organizationId:user.organizationId,jobId:id,createdById:user.id,tokenHash:hashClientShareToken(token),label:String(body.label||"").trim().slice(0,120)||null,expiresAt:shareExpiry(days)}});
 await audit({organizationId:user.organizationId,userId:user.id,action:"CLIENT_SHARE_CREATED",entityType:"ClientShare",entityId:share.id,details:`job=${job.title}; expires=${share.expiresAt.toISOString()}`}).catch(()=>undefined);
 return NextResponse.json({id:share.id,url:`/share/${token}`,expiresAt:share.expiresAt});
}
