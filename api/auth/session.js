// Exchanges a Supabase access token (from Google sign-in or a magic link) for a Black Ops
// session cookie, after confirming the user with Supabase and checking the email domain.
import { allowed, cookieHeader, MAX_AGE, sign } from "../../lib/session.js";

const PROVEN = new Set(["oauth", "otp", "magiclink"]);

export function inboxProven(jwt) {
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { amr } = JSON.parse(atob(part));
    return Array.isArray(amr) && amr.length > 0 && amr.every((m) => PROVEN.has(m && m.method));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_SECRET, ALLOWED_DOMAIN } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !AUTH_SECRET || !ALLOWED_DOMAIN) {
    return Response.json({ error: "Sign-in is not configured." }, { status: 500 });
  }
  let token;
  try { ({ access_token: token } = await request.json()); } catch { /* handled below */ }
  if (!token) return Response.json({ error: "Missing sign-in token." }, { status: 400 });

  // Ask Supabase who this token belongs to; never trust the browser's claim.
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!res.ok) return Response.json({ error: "That sign-in link has expired. Request a new one." }, { status: 401 });
  const user = await res.json();

  // Only accept sessions that proved the person controls the inbox: a Google sign-in or an
  // emailed link/code. An Apex email+password login is refused, because a password signup
  // doesn't show the address is real. Supabase just verified this token, so its claims are
  // authentic.
  if (!inboxProven(token)) {
    return Response.json({ error: "Use Continue with Google or an emailed sign-in link." }, { status: 403 });
  }
  const email = (user.email || "").toLowerCase();
  if (!allowed(email, ALLOWED_DOMAIN) || !user.email_confirmed_at) {
    return Response.json({ error: `Black Ops is only open to @${ALLOWED_DOMAIN} accounts.` }, { status: 403 });
  }
  return new Response(JSON.stringify({ ok: true, email }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookieHeader(await sign(email, AUTH_SECRET), MAX_AGE) }
  });
}
