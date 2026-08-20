import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "../../../lib/db";
import { apiUser, audit } from "../../../lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const { id } = await params;
    const candidate = await prisma.candidate.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!candidate) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });

    if (candidate.filePathname && process.env.BLOB_READ_WRITE_TOKEN) {
      try { await del(candidate.filePathname); }
      catch (error) {
        console.error("Private CV deletion failed", error);
        return NextResponse.json({ error: "Le fichier privé n'a pas pu être supprimé. Suppression interrompue." }, { status: 502 });
      }
    }

    await prisma.candidate.delete({ where: { id: candidate.id } });
    await audit({ organizationId:user.organizationId, userId:user.id, action:"CANDIDATE_DELETED", entityType:"Candidate", entityId:id, details:candidate.fullName });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de supprimer le candidat" }, { status: 500 });
  }
}
