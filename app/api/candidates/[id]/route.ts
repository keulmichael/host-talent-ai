import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const { id } = await params;
    const candidate = await prisma.candidate.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!candidate) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    await prisma.candidate.delete({ where: { id } });
    await audit({ organizationId:user.organizationId, userId:user.id, action:"CANDIDATE_DELETED", entityType:"Candidate", entityId:id, details:candidate.fullName });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de supprimer le candidat" }, { status: 500 });
  }
}
