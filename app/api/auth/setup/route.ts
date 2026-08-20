import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { SESSION_COOKIE, audit, createSession, hashPassword } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) return NextResponse.json({ error: "L'initialisation a déjà été effectuée." }, { status: 409 });

    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const organizationName = String(body.organizationName || "Host Agency").trim() || "Host Agency";

    if (fullName.length < 2 || !email.includes("@") || password.length < 10) {
      return NextResponse.json({ error: "Nom, e-mail valide et mot de passe d'au moins 10 caractères requis." }, { status: 400 });
    }

    const organization = await prisma.organization.upsert({
      where: { id: "host-demo" },
      update: { name: organizationName },
      create: { id: "host-demo", name: organizationName }
    });

    const user = await prisma.user.create({
      data: {
        organizationId: organization.id,
        email,
        fullName,
        passwordHash: hashPassword(password),
        role: "ADMIN"
      }
    });

    await audit({ organizationId: organization.id, userId: user.id, action: "ADMIN_SETUP", entityType: "User", entityId: user.id });
    const session = await createSession(user.id);
    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'initialiser l'espace cabinet." }, { status: 500 });
  }
}
