import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser(); if(!user)return NextResponse.json({error:"Authentification requise"},{status:401}); const{id}=await params; const body=await req.json().catch(()=>({}));
 const share=await prisma.clientShare.findFirst({where:{id,organizationId:user.organizationId}}); if(!share)return NextResponse.json({error:"Partage introuvable"},{status:404});
 const active=Boolean(body.active); const updated=await prisma.clientShare.update({where:{id},data:{active}});
 await audit({organizationId:user.organizationId,userId:user.id,action:active?"CLIENT_SHARE_REACTIVATED":"CLIENT_SHARE_REVOKED",entityType:"ClientShare",entityId:id}).catch(()=>undefined);
 return NextResponse.json(updated);
}
