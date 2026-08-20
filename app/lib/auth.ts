import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export const SESSION_COOKIE = "host_talent_session";
const ITERATIONS = 210000;
const KEYLEN = 32;
const DIGEST = "sha256";
const SESSION_DAYS = 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex");
  return `pbkdf2:${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [kind, iterationsRaw, salt, expectedHex] = stored.split(":");
  if (kind !== "pbkdf2" || !iterationsRaw || !salt || !expectedHex) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations < 100000) return false;
  const actual = pbkdf2Sync(password, salt, iterations, KEYLEN, DIGEST);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token?: string | null) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: { include: { organization: true } } }
  });
  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function apiUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function audit(input: {
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
}) {
  await prisma.auditLog.create({ data: input });
}
