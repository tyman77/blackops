// Every request to blackops.summitintegrated.com passes through here first.
// Without a valid Summit session cookie, only the sign-in page and its endpoints are reachable.
import { next } from "@vercel/functions";
import { COOKIE, readCookie, verify } from "./lib/session.js";

const PUBLIC = ["/login", "/login.html", "/auth/callback", "/auth/callback.html", "/api/auth/session", "/api/auth/logout", "/assets/summit.jpg", "/favicon.ico", "/robots.txt"];

export default async function middleware(request) {
  const url = new URL(request.url);
  if (PUBLIC.includes(url.pathname)) return next();

  const email = await verify(readCookie(request, COOKIE), process.env.AUTH_SECRET, process.env.ALLOWED_DOMAIN);
  if (email) return next({ headers: { "x-blackops-user": email } });

  // pages go to the sign-in screen; files (data.js, images) just get refused
  const wantsPage = url.pathname === "/" || url.pathname.endsWith(".html") || !url.pathname.includes(".");
  if (!wantsPage) return new Response("Sign in required", { status: 401 });
  const login = new URL("/login", url);
  if (url.pathname !== "/") login.searchParams.set("next", url.pathname);
  return Response.redirect(login, 302);
}

export const config = { matcher: "/:path*" };
