import { NextRequest, NextResponse } from "next/server";

const COOKIE = "host_talent_session";
const PUBLIC_PATHS = new Set(["/login", "/setup", "/api/auth/login", "/api/auth/setup", "/api/auth/logout"]);

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (PUBLIC_PATHS.has(path)) return NextResponse.next();
  const token = req.cookies.get(COOKIE)?.value;
  if (token) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  const url = new URL("/login", req.url);
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
