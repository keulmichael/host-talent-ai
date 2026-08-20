import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { PIPELINE_STAGES } from "../../../lib/pipeline";

const allowed = new Set(PIPELINE_STAGES.map((s) => s.value));

export async function PATCH(req: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const stage = String(body.stage || "NEW");
    if (!allowed.has(stage as never)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    const match = await prisma.match.update({
      where: { id },
      data: {
        stage,
        recruiterNote: String(body.recruiterNote || "").trim() || null,
        nextAction: String(body.nextAction || "").trim() || null
      }
    });
    return NextResponse.json(match);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de mettre à jour le suivi" }, { status: 500 });
  }
}
