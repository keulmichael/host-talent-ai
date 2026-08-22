import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";
import { createCandidateSurveyToken, hashCandidateSurveyToken, candidateSurveyExpiry } from "../../../../lib/candidateExperience";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  const { id } = await params;
  const input = await request.json().catch(() => ({}));
  const match = await prisma.match.findFirst({ where: { id, organizationId: user.organizationId }, include: { candidate: true, job: true } });
  if (!match) return NextResponse.json({ error: "Matching introuvable" }, { status: 404 });
  const days = Math.min(30, Math.max(1, Number(input.days) || 14));
  const step = String(input.step || match.stage || "PROCESS").trim().slice(0, 40).toUpperCase();
  const accessKey = createCandidateSurveyToken();
  const survey = await prisma.candidateSurvey.create({ data: { organizationId: user.organizationId, matchId: id, createdById: user.id, tokenHash: hashCandidateSurveyToken(accessKey), step, expiresAt: candidateSurveyExpiry(days) } });
  await audit({ organizationId: user.organizationId, userId: user.id, action: "CANDIDATE_SURVEY_CREATED", entityType: "CandidateSurvey", entityId: survey.id, details: `candidate=${match.candidate.fullName}; job=${match.job.title}; step=${step}` }).catch(() => undefined);
  return NextResponse.json({ id: survey.id, url: `/candidate-experience/${accessKey}`, expiresAt: survey.expiresAt });
}
