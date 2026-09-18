export type ServiceAccount = { client_email: string; private_key: string; token_uri: string };

type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

function base64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemBytes(pem: string) {
  const raw = atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, ""));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function parseServiceAccountJson(serialized: string): ServiceAccount {
  const parsed = JSON.parse(serialized) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key || !parsed.token_uri) throw new Error("AITT_DR_SERVICE_ACCOUNT_INVALID");
  return { client_email: parsed.client_email, private_key: parsed.private_key, token_uri: parsed.token_uri };
}

export async function getGoogleAccessToken(serializedServiceAccount: string, fetchImpl: typeof fetch = fetch, now = Date.now()) {
  if (cachedToken && cachedToken.expiresAt - now > 120_000) return cachedToken.value;
  const account = parseServiceAccountJson(serializedServiceAccount);
  const issuedAt = Math.floor(now / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: account.token_uri, iat: issuedAt, exp: issuedAt + 3600 }));
  const key = await crypto.subtle.importKey("pkcs8", pemBytes(account.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const response = await fetchImpl(account.token_uri, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(`${header}.${claim}.${base64Url(new Uint8Array(signature))}`)}` });
  if (!response.ok) throw new Error("GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED");
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error("GOOGLE_OAUTH_TOKEN_MISSING");
  cachedToken = { value: payload.access_token, expiresAt: now + (payload.expires_in ?? 3600) * 1000 };
  return payload.access_token;
}

export function clearGoogleAccessTokenCache() { cachedToken = null; }
