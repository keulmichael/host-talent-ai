import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { explainMatch } from "../../lib/matching";
import { extractCandidate } from "../../lib/extract";
import { apiUser, audit } from "../../lib/auth";

export async function POST() {
  try {
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const [jobs, existingCandidates] = await Promise.all([
      prisma.job.findMany({ where: { organizationId: user.organizationId } }),
      prisma.candidate.findMany({ where: { organizationId: user.organizationId } })
    ]);

    const candidates = [];
    let refreshed = 0;

    // Rejoue l'extraction sur les CV deja presents afin que les ameliorations
    // du moteur (anciennete, langues, competences, localisation) s'appliquent
    // aussi aux candidats importes avant la nouvelle version.
    for (const candidate of existingCandidates) {
      const extracted = extractCandidate(candidate.rawText);
      const updated = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          email: candidate.email || extracted.email || null,
          location: candidate.location || extracted.location || null,
          summary: extracted.summary,
          skills: extracted.skills.join(", "),
          experienceYears: extracted.years
        }
      });
      candidates.push(updated);
      refreshed++;
    }

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
            organizationId: user.organizationId,
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

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "ALL_MATCHES_RECOMPUTED",
      details: `${jobs.length} missions, ${candidates.length} candidats re-extraits, ${count} matchings`
    });

    return NextResponse.json({
      ok: true,
      jobs: jobs.length,
      candidates: candidates.length,
      refreshed,
      matches: count
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de recalculer les matchings" }, { status: 500 });
  }
}
