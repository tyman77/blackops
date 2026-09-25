import { cookieHeader } from "../../lib/session.js";

export function GET() {
  return new Response(null, { status: 302, headers: { Location: "/login?signedout=1", "Set-Cookie": cookieHeader("", 0) } });
}
