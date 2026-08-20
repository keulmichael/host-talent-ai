export const ACCESS_COOKIE = "host_talent_session";

export function accessConfigured() {
  return Boolean(process.env.APP_ACCESS_PASSWORD && process.env.APP_AUTH_SECRET);
}

export async function accessToken() {
  const password = process.env.APP_ACCESS_PASSWORD || "";
  const secret = process.env.APP_AUTH_SECRET || "";
  const data = new TextEncoder().encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
