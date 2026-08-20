import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { explainMatch } from "../../lib/matching";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title: String(body.title).trim(),
        clientName: body.clientName ? String(body.clientName).trim() : null,
        location: body.location ? String(body.location).trim() : null,
        description: String(body.description).trim(),
        mustHave: String(body.mustHave || "").trim(),
        shouldHave: String(body.shouldHave || "").trim(),
        optional: String(body.optional || "").trim()
      }
    });

    const candidates = await prisma.candidate.findMany();
    for (const candidate of candidates) {
      const match = explainMatch(job, candidate);
      await prisma.match.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          score: match.score,
          matched: match.matched.join(", "),
          missing: match.missing.join(", "),
          questions: match.questions.join("\n"),
          explanation: match.explanation
        }
      });
    }

    return NextResponse.json({ ...job, matchedCandidates: candidates.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer la mission" }, { status: 500 });
  }
}
