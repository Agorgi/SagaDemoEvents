import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "cos_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

interface AdminSessionPayload {
  email: string;
  exp: number;
}

function toBase64Url(value: Uint8Array | string) {
  const input =
    typeof value === "string"
      ? value
      : String.fromCharCode(...Array.from(value));

  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return toBase64Url(new Uint8Array(signature));
}

function sessionSecret() {
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  const cronSecret = process.env.CRON_SECRET?.trim() ?? "";

  if (!email || !password || !cronSecret) {
    throw new Error("Admin auth requires ADMIN_EMAIL, ADMIN_PASSWORD, and CRON_SECRET.");
  }

  return `${email}:${password}:${cronSecret}`;
}

export async function createAdminSessionToken(email: string) {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_TTL_MS
  });
  const encodedPayload = toBase64Url(payload);
  const signature = await hmac(encodedPayload, sessionSecret());
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await hmac(encodedPayload, sessionSecret());

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const decoded = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(decoded) as Partial<AdminSessionPayload>;

    if (!payload.email || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return {
      email: payload.email,
      exp: payload.exp
    } satisfies AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(email: string) {
  const token = await createAdminSessionToken(email);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export function clearAdminSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export { SESSION_COOKIE_NAME };
