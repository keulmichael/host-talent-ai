export function blobAuthOptions() {
  const options: { token?: string; oidcToken?: string; storeId?: string } = {};
  if (process.env.BLOB_READ_WRITE_TOKEN) options.token = process.env.BLOB_READ_WRITE_TOKEN;
  if (process.env.VERCEL_OIDC_TOKEN) options.oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (process.env.BLOB_STORE_ID) options.storeId = process.env.BLOB_STORE_ID;
  return options;
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

export function blobAuthMode() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "read-write-token";
  if (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) return "oidc";
  if (process.env.BLOB_STORE_ID) return "project-store";
  return "not-configured";
}
