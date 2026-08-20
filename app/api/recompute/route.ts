import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { explainMatch } from "../../lib/matching";

export async function POST() {
  try {
    const [jobs, candidates] = await Promise.all([prisma.job.findMany(), prisma.candidate.findMany()]);
    let count = 0;
    for (const job of jobs) {
      for (const candidate of candidates) {
        const match = explainMatch(job, candidate);
        await prisma.match.upsert({
          where: { jobId_candidateId: { jobId: job.id, candidateId: candidate.id } },
          update: {
            score: match.score,
            matched: match.matched.join(", "),
            missing: match.missing.join(", "),
            questions: match.questions.join("\n"),
            explanation: match.explanation
          },
          create: {
            jobId: job.id,
            candidateId: candidate.id,
            score: match.score,
            matched: match.matched.join(", "),
            missing: match.missing.join(", "),
            questions: match.questions.join("\n"),
            explanation: match.explanation
          }
        });
        count++;
      }
    }
    return NextResponse.json({ ok: true, jobs: jobs.length, candidates: candidates.length, matches: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de recalculer les matchings" }, { status: 500 });
  }
}
