import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { explainMatch } from "../../lib/matching";
import { apiUser, audit } from "../../lib/auth";

export async function POST(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const body = await req.json();
    if (!body.title || !body.description) return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });

    const job = await prisma.job.create({
      data: {
        organizationId: user.organizationId,
        title: String(body.title).trim(),
        clientName: body.clientName ? String(body.clientName).trim() : null,
        location: body.location ? String(body.location).trim() : null,
        description: String(body.description).trim(),
        mustHave: String(body.mustHave || "").trim(),
        shouldHave: String(body.shouldHave || "").trim(),
        optional: String(body.optional || "").trim()
      }
    });

    const candidates = await prisma.candidate.findMany({ where: { organizationId: user.organizationId } });
    for (const candidate of candidates) {
      const match = explainMatch(job, candidate);
      await prisma.match.create({ data: { organizationId: user.organizationId, jobId: job.id, candidateId: candidate.id, score: match.score, matched: match.matched.join(", "), missing: match.missing.join(", "), questions: match.questions.join("\n"), explanation: match.explanation } });
    }
    await audit({ organizationId: user.organizationId, userId: user.id, action: "JOB_CREATED", entityType: "Job", entityId: job.id, details: job.title });
    return NextResponse.json({ ...job, matchedCandidates: candidates.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer la mission" }, { status: 500 });
  }
}
