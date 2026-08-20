import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { PIPELINE_STAGES } from "../../../lib/pipeline";
import { apiUser, audit } from "../../../lib/auth";

const allowed = new Set<string>(PIPELINE_STAGES.map((s) => s.value));

export async function PATCH(req: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const stage = String(body.stage || "NEW");
    if (!allowed.has(stage)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    const existing = await prisma.match.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return NextResponse.json({ error: "Matching introuvable" }, { status: 404 });
    const match = await prisma.match.update({
      where: { id },
      data: {
        stage,
        recruiterNote: String(body.recruiterNote || "").trim() || null,
        nextAction: String(body.nextAction || "").trim() || null
      }
    });
    await audit({ organizationId:user.organizationId, userId:user.id, action:"MATCH_UPDATED", entityType:"Match", entityId:id, details:`stage=${stage}; next=${match.nextAction || ""}` });
    return NextResponse.json(match);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de mettre à jour le suivi" }, { status: 500 });
  }
}
