import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession, getCurrentSession, audit } from "../../../lib/auth";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const current = await getCurrentSession();
  if (current) {
    await audit({ organizationId: current.user.organizationId, userId: current.user.id, action: "LOGOUT", entityType: "User", entityId: current.user.id }).catch(() => undefined);
  }
  await destroySession(token).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
