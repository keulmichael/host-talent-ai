import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit, hashPassword, verifyPassword } from "../../../lib/auth";

export async function POST(req:Request){
 try{
  const user=await apiUser(); if(!user) return NextResponse.json({error:"Authentification requise"},{status:401});
  const body=await req.json(); const current=String(body.currentPassword||""); const next=String(body.newPassword||"");
  const fresh=await prisma.user.findUnique({where:{id:user.id}}); if(!fresh||!verifyPassword(current,fresh.passwordHash)) return NextResponse.json({error:"Mot de passe actuel incorrect."},{status:401});
  if(next.length<10) return NextResponse.json({error:"Le nouveau mot de passe doit contenir au moins 10 caractères."},{status:400});
  await prisma.user.update({where:{id:user.id},data:{passwordHash:hashPassword(next)}});
  await prisma.session.deleteMany({where:{userId:user.id}});
  await audit({organizationId:user.organizationId,userId:user.id,action:"PASSWORD_CHANGED",entityType:"User",entityId:user.id});
  return NextResponse.json({ok:true,reauthenticate:true});
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible de modifier le mot de passe."},{status:500});}
}
