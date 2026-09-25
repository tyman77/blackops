// Signed session cookie shared by the middleware and the auth functions.
// Token: base64url(JSON {e: email, x: expiry seconds}) + "." + base64url(HMAC-SHA256).
export const COOKIE = "bo_session";
export const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sign(email, secret) {
  const body = b64url(enc.encode(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + MAX_AGE })));
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

// Returns the email if the token is authentic, unexpired and on the allowed domain; otherwise null.
export async function verify(token, secret, domain) {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const { e, x } = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    if (!e || !x || x < Date.now() / 1000) return null;
    if (!allowed(e, domain)) return null;
    return e;
  } catch {
    return null;
  }
}

export const allowed = (email, domain) => typeof email === "string" && !!domain && email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);

export function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export const cookieHeader = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
