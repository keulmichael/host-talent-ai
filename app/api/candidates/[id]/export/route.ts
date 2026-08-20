import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id:string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  const { id } = await params;
  const candidate = await prisma.candidate.findFirst({
    where: { id, organizationId:user.organizationId },
    include: { matches: { where:{organizationId:user.organizationId}, include:{job:{select:{title:true,clientName:true}}}, orderBy:{score:"desc"} } }
  });
  if (!candidate) return NextResponse.json({ error:"Candidat introuvable" }, { status:404 });
  await audit({ organizationId:user.organizationId, userId:user.id, action:"CANDIDATE_DATA_EXPORTED", entityType:"Candidate", entityId:candidate.id, details:candidate.fullName });
  const payload = {
    exportedAt: new Date().toISOString(),
    candidate: {
      id:candidate.id, fullName:candidate.fullName, email:candidate.email, location:candidate.location,
      sourceFileName:candidate.sourceFileName, summary:candidate.summary, skills:candidate.skills,
      experienceYears:candidate.experienceYears, dataSource:candidate.dataSource, privacyNote:candidate.privacyNote,
      retentionUntil:candidate.retentionUntil, createdAt:candidate.createdAt, originalFileStored:Boolean(candidate.filePathname)
    },
    matches: candidate.matches.map((m)=>({ mission:m.job.title, client:m.job.clientName, score:m.score, matched:m.matched, missing:m.missing, questions:m.questions, explanation:m.explanation, stage:m.stage, recruiterNote:m.recruiterNote, nextAction:m.nextAction }))
  };
  return new Response(JSON.stringify(payload,null,2), { headers:{ "Content-Type":"application/json; charset=utf-8", "Content-Disposition":`attachment; filename="candidate-${candidate.id}.json"`, "Cache-Control":"private, no-store" } });
}
