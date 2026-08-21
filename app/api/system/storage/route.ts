import { NextResponse } from "next/server";
import { apiUser } from "../../../lib/auth";
import { blobAuthMode, blobConfigured } from "../../../lib/blob";

export async function GET() {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  return NextResponse.json({
    configured: blobConfigured(),
    mode: blobAuthMode(),
    privateStore: Boolean(process.env.BLOB_STORE_ID),
    environment: process.env.VERCEL_ENV || "unknown"
  });
}
