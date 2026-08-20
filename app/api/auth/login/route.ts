import { NextResponse } from "next/server";
import { ACCESS_COOKIE, accessConfigured, accessToken } from "../../../lib/access";

export async function POST(req: Request) {
  if (!accessConfigured()) return NextResponse.json({ error: "Protection non configurée" }, { status: 503 });
  const body = await req.json();
  if (String(body.password || "") !== process.env.APP_ACCESS_PASSWORD) {
    return NextResponse.json({ error: "Code d'accès incorrect" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, await accessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
