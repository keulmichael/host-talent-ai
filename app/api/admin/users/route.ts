import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit, hashPassword } from "../../../lib/auth";

export async function GET(){
 const user=await apiUser();
 if(!user) return NextResponse.json({error:"Authentification requise"},{status:401});
 if(user.role!=="ADMIN") return NextResponse.json({error:"Droits administrateur requis"},{status:403});
 const users=await prisma.user.findMany({where:{organizationId:user.organizationId},select:{id:true,fullName:true,email:true,role:true,active:true,createdAt:true},orderBy:{createdAt:"asc"}});
 return NextResponse.json(users);
}

export async function POST(req:Request){
 try{
  const admin=await apiUser();
  if(!admin) return NextResponse.json({error:"Authentification requise"},{status:401});
  if(admin.role!=="ADMIN") return NextResponse.json({error:"Droits administrateur requis"},{status:403});
  const body=await req.json();
  const fullName=String(body.fullName||"").trim(); const email=String(body.email||"").trim().toLowerCase(); const password=String(body.password||""); const role=String(body.role||"RECRUITER")==="ADMIN"?"ADMIN":"RECRUITER";
  if(fullName.length<2||!email.includes("@")||password.length<10) return NextResponse.json({error:"Nom, e-mail valide et mot de passe d'au moins 10 caractères requis."},{status:400});
  const exists=await prisma.user.findUnique({where:{email}}); if(exists) return NextResponse.json({error:"Cet e-mail est déjà utilisé."},{status:409});
  const created=await prisma.user.create({data:{organizationId:admin.organizationId,fullName,email,passwordHash:hashPassword(password),role}});
  await audit({organizationId:admin.organizationId,userId:admin.id,action:"USER_CREATED",entityType:"User",entityId:created.id,details:`${created.email}; role=${created.role}`});
  return NextResponse.json({id:created.id,fullName:created.fullName,email:created.email,role:created.role,active:created.active});
 }catch(error){console.error(error);return NextResponse.json({error:"Impossible de créer l'utilisateur"},{status:500});}
}
