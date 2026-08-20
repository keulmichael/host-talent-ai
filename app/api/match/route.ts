import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { explainMatch } from "../../lib/matching";
import { apiUser, audit } from "../../lib/auth";

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  const { jobId } = await req.json();
  const job = await prisma.job.findFirst({ where: { id: jobId, organizationId: user.organizationId } });
  if (!job) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
  const candidates = await prisma.candidate.findMany({ where: { organizationId: user.organizationId } });
  for (const candidate of candidates) {
    const x = explainMatch(job, candidate);
    await prisma.match.upsert({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
      update: { score:x.score, matched:x.matched.join(", "), missing:x.missing.join(", "), questions:x.questions.join("\n"), explanation:x.explanation },
      create: { organizationId:user.organizationId, jobId, candidateId:candidate.id, score:x.score, matched:x.matched.join(", "), missing:x.missing.join(", "), questions:x.questions.join("\n"), explanation:x.explanation }
    });
  }
  await audit({ organizationId:user.organizationId, userId:user.id, action:"JOB_MATCH_RECOMPUTED", entityType:"Job", entityId:job.id, details:`${candidates.length} candidats` });
  return NextResponse.json({ ok:true, count:candidates.length });
}
