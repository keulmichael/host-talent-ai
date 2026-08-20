import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

export async function PATCH(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error:"Authentification requise" }, { status:401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error:"Droits administrateur requis" }, { status:403 });
  const body = await req.json();
  const months = Number(body.retentionMonths);
  if (![6,12,18,24,36,48,60].includes(months)) return NextResponse.json({ error:"Durée non autorisée" }, { status:400 });
  const organization = await prisma.organization.update({ where:{id:user.organizationId}, data:{retentionMonths:months} });
  await audit({ organizationId:user.organizationId, userId:user.id, action:"RETENTION_POLICY_UPDATED", entityType:"Organization", entityId:user.organizationId, details:`${months} mois` });
  return NextResponse.json({ ok:true, retentionMonths:organization.retentionMonths });
}
