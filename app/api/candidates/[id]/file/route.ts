import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { apiUser, audit } from "../../../../lib/auth";
import { blobAuthOptions, blobConfigured } from "../../../../lib/blob";

export async function GET(_: Request, { params }: { params: Promise<{ id:string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  const { id } = await params;
  const candidate = await prisma.candidate.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!candidate?.filePathname) return NextResponse.json({ error: "Aucun fichier original stocké" }, { status: 404 });
  if (!blobConfigured()) return NextResponse.json({ error: "Stockage privé non configuré" }, { status: 503 });

  const result = await get(candidate.filePathname, { access: "private", useCache: false, ...blobAuthOptions() });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });

  await audit({ organizationId:user.organizationId, userId:user.id, action:"CV_DOWNLOADED", entityType:"Candidate", entityId:candidate.id, details:candidate.sourceFileName || candidate.fullName });
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || candidate.fileContentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(candidate.sourceFileName || "cv")}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store"
    }
  });
}
