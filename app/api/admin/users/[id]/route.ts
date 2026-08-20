import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const admin=await apiUser(); if(!admin) return NextResponse.json({error:"Authentification requise"},{status:401}); if(admin.role!=="ADMIN") return NextResponse.json({error:"Droits administrateur requis"},{status:403});
  const{id}=await params; const target=await prisma.user.findFirst({where:{id,organizationId:admin.organizationId}}); if(!target) return NextResponse.json({error:"Utilisateur introuvable"},{status:404});
  const body=await req.json(); const data:{active?:boolean;role?:string}={};
  if(typeof body.active==="boolean") data.active=body.active;
  if(body.role!==undefined) data.role=String(body.role)==="ADMIN"?"ADMIN":"RECRUITER";
  if(id===admin.id && data.active===false) return NextResponse.json({error:"Vous ne pouvez pas désactiver votre propre compte."},{status:400});
  const updated=await prisma.user.update({where:{id},data});
  if(data.active===false) await prisma.session.deleteMany({where:{userId:id}});
  await audit({organizationId:admin.organizationId,userId:admin.id,action:"USER_UPDATED",entityType:"User",entityId:id,details:`active=${updated.active}; role=${updated.role}`});
  return NextResponse.json({id:updated.id,fullName:updated.fullName,email:updated.email,role:updated.role,active:updated.active});
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible de mettre à jour l'utilisateur"},{status:500});}
}
