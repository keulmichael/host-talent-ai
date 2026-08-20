import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const { id } = await params;
    await prisma.candidate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de supprimer le candidat" }, { status: 500 });
  }
}
