import { NextResponse } from "next/server";
import { apiUser, audit } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { analyzeCandidateWithAi } from "../../../../lib/ai/candidateAnalysis";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  const { id } = await params;
  const candidate = await prisma.candidate.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { id: true, fullName: true, rawText: true },
  });

  if (!candidate) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
  if (!candidate.rawText?.trim()) return NextResponse.json({ error: "Aucun contenu CV exploitable" }, { status: 400 });

  const result = await analyzeCandidateWithAi(candidate.rawText);

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "CANDIDATE_AI_ANALYSIS",
    entityType: "Candidate",
    entityId: candidate.id,
    details: result.data ? "Analyse IA générée" : `Analyse IA indisponible: ${result.error || result.source}`,
  }).catch(() => undefined);

  if (!result.enabled) {
    return NextResponse.json({ error: "La couche IA n'est pas configurée sur cet environnement." }, { status: 503 });
  }
  if (!result.data) {
    return NextResponse.json({ error: result.error || "Analyse IA indisponible" }, { status: 502 });
  }

  return NextResponse.json({ candidateName: candidate.fullName, analysis: result.data, source: result.source });
}
