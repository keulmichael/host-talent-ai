export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "../../lib/db";
import { extractCandidate } from "../../lib/extract";
import { explainMatch } from "../../lib/matching";
import { apiUser, audit } from "../../lib/auth";
import { blobAuthOptions, blobConfigured } from "../../lib/blob";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
}

function retentionDate(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

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
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const fd = await req.formData();
    const fullName = String(fd.get("fullName") || "").trim();
    const location = String(fd.get("location") || "").trim();
    const dataSource = String(fd.get("dataSource") || "CV_IMPORT").trim().slice(0, 80);
    const privacyNote = String(fd.get("privacyNote") || "").trim().slice(0, 1000);
    const requestedRetention = Number(fd.get("retentionMonths") || 0);
    const organization = await prisma.organization.findUnique({ where: { id: user.organizationId }, select: { retentionMonths: true } });
    const retentionMonths = [6, 12, 18, 24, 36, 48, 60].includes(requestedRetention)
      ? requestedRetention
      : (organization?.retentionMonths || 24);

    let rawText = String(fd.get("rawText") || "").trim();
    const file = fd.get("file");

    if (file instanceof File && file.size) {
      const lower = file.name.toLowerCase();
      if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        return NextResponse.json({ error: "Format non autorisé. Utilise PDF, DOCX ou TXT." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Le CV dépasse la limite de 10 Mo." }, { status: 400 });
      }
      rawText = await fileToText(file);
    }

    if (!fullName || !rawText) return NextResponse.json({ error: "Nom et CV requis" }, { status: 400 });
    if (rawText.length < 80) return NextResponse.json({ error: "Le contenu du CV semble trop court ou illisible." }, { status: 400 });

    const extracted = extractCandidate(rawText);
    if (extracted.email) {
      const duplicate = await prisma.candidate.findFirst({
        where: { organizationId: user.organizationId, email: { equals: extracted.email, mode: "insensitive" } }
      });
      if (duplicate) return NextResponse.json({ error: `Un candidat avec l'e-mail ${extracted.email} existe déjà.`, candidateId: duplicate.id }, { status: 409 });
    }

    let candidate = await prisma.candidate.create({
      data: {
        organizationId: user.organizationId,
        fullName,
        email: extracted.email || null,
        location: location || null,
        sourceFileName: file instanceof File && file.size ? file.name : null,
        rawText,
        summary: extracted.summary,
        skills: extracted.skills.join(", "),
        experienceYears: extracted.years,
        dataSource,
        privacyNote: privacyNote || null,
        retentionUntil: retentionDate(retentionMonths)
      }
    });

    if (file instanceof File && file.size && blobConfigured()) {
      try {
        const pathname = `${user.organizationId}/candidates/${candidate.id}/${safeName(file.name)}`;
        const blob = await put(pathname, file, {
          access: "private",
          addRandomSuffix: false,
          contentType: file.type || undefined,
          ...blobAuthOptions()
        });
        candidate = await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            filePathname: blob.pathname,
            fileContentType: file.type || "application/octet-stream",
            fileSize: file.size
          }
        });
        await audit({ organizationId: user.organizationId, userId: user.id, action: "CV_STORED_PRIVATE", entityType: "Candidate", entityId: candidate.id, details: blob.pathname });
      } catch (storageError) {
        console.error("CV private storage failed", storageError);
        await audit({ organizationId: user.organizationId, userId: user.id, action: "CV_STORAGE_FAILED", entityType: "Candidate", entityId: candidate.id, details: file.name });
      }
    }

    const jobs = await prisma.job.findMany({ where: { organizationId: user.organizationId } });
    for (const job of jobs) {
      const match = explainMatch(job, candidate);
      await prisma.match.create({ data: {
        organizationId: user.organizationId,
        jobId: job.id,
        candidateId: candidate.id,
        score: match.score,
        matched: match.matched.join(", "),
        missing: match.missing.join(", "),
        questions: match.questions.join("\n"),
        explanation: match.explanation
      }});
    }

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "CANDIDATE_CREATED",
      entityType: "Candidate",
      entityId: candidate.id,
      details: `${candidate.fullName} · source=${dataSource} · retention=${retentionMonths}m · file=${candidate.filePathname ? "private" : "text-only"}`
    });

    return NextResponse.json({ ...candidate, matchedJobs: jobs.length, privateFileStored: Boolean(candidate.filePathname) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'analyser le CV" }, { status: 500 });
  }
}
