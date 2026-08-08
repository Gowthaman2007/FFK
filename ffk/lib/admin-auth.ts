const COOKIE_NAME = "ffk_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToHex(new Uint8Array(signature));
}

export async function createAdminSessionToken() {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 }))
  );
  return `${payload}.${await sign(payload)}`;
}

export async function isValidAdminSession(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  try {
    const [payload, signatureHex] = parts;
    const key = await getKey();
    const signature = new Uint8Array(signatureHex.match(/.{1,2}/g)?.map((x) => parseInt(x, 16)) ?? []);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}

export { COOKIE_NAME };
