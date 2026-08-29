import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { SESSION_COOKIE, audit, createSession, verifyPassword } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const [session] = await Promise.all([
      createSession(user.id),
      prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } }),
      audit({ organizationId: user.organizationId, userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id }),
    ]);

    const response = NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
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
    return NextResponse.json({ error: "Connexion impossible." }, { status: 500 });
  }
}
