export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { extractCandidate } from "../../lib/extract";
import { explainMatch } from "../../lib/matching";

async function fileToText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mammoth = (await import("mammoth")).default;
    return (await mammoth.extractRawText({ buffer })).value;
  }
  if (name.endsWith(".pdf")) {
    const pdf = (await import("pdf-parse")).default;
    return (await pdf(buffer)).text;
  }
  return buffer.toString("utf8");
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const fullName = String(fd.get("fullName") || "").trim();
    const location = String(fd.get("location") || "").trim();
    let rawText = String(fd.get("rawText") || "").trim();
    const file = fd.get("file");

    if (file instanceof File && file.size) rawText = await fileToText(file);
    if (!fullName || !rawText) {
      return NextResponse.json({ error: "Nom et CV requis" }, { status: 400 });
    }

    const extracted = extractCandidate(rawText);
    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        email: extracted.email || null,
        location: location || null,
        sourceFileName: file instanceof File && file.size ? file.name : null,
        rawText,
        summary: extracted.summary,
        skills: extracted.skills.join(", "),
        experienceYears: extracted.years
      }
    });

    const jobs = await prisma.job.findMany();
    for (const job of jobs) {
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
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'analyser le CV" }, { status: 500 });
  }
}
