import { NextRequest, NextResponse } from "next/server";

const COOKIE = "host_talent_session";

async function expectedToken() {
  const password = process.env.APP_ACCESS_PASSWORD || "";
  const secret = process.env.APP_AUTH_SECRET || "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${password}:${secret}`));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(req: NextRequest) {
  const configured = Boolean(process.env.APP_ACCESS_PASSWORD && process.env.APP_AUTH_SECRET);
  if (!configured) return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (path === "/login" || path === "/api/auth/login") return NextResponse.next();
  const token = req.cookies.get(COOKIE)?.value;
  if (token === await expectedToken()) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
