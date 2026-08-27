import { NextResponse } from "next/server";
import { apiUser, audit } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { analyzeMissionFitWithAi } from "../../../../lib/ai/semanticMatch";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  const { id } = await params;
  const match = await prisma.match.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      candidate: { select: { id: true, fullName: true, rawText: true } },
      job: { select: { id: true, title: true, description: true, mustHave: true, shouldHave: true, optional: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Matching introuvable" }, { status: 404 });
  if (!match.candidate.rawText?.trim()) return NextResponse.json({ error: "Aucun contenu CV exploitable" }, { status: 400 });

  const result = await analyzeMissionFitWithAi({
    candidateText: match.candidate.rawText,
    jobTitle: match.job.title,
    jobDescription: match.job.description,
    mustHave: match.job.mustHave,
    shouldHave: match.job.shouldHave,
    optional: match.job.optional,
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "MATCH_AI_ANALYSIS",
    entityType: "Match",
    entityId: match.id,
    details: result.data ? `Analyse IA mission générée pour ${match.candidate.fullName}` : `Analyse IA mission indisponible: ${result.error || result.source}`,
  }).catch(() => undefined);

  if (!result.enabled) return NextResponse.json({ error: "La couche IA n'est pas configurée sur cet environnement." }, { status: 503 });
  if (!result.data) return NextResponse.json({ error: result.error || "Analyse IA indisponible" }, { status: 502 });

  return NextResponse.json({
    matchId: match.id,
    candidateName: match.candidate.fullName,
    jobTitle: match.job.title,
    deterministicScore: match.score,
    analysis: result.data,
    source: result.source,
  });
}
