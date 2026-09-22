import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADMIN_COOKIE = "velvea_admin";
const MIN_SECRET_LENGTH = 32;

/**
 * Middleware runs on the edge and cannot import "server-only" modules, so the
 * AUTH_SECRET check is repeated here. It fails closed: with no usable secret
 * nobody reaches /admin, rather than everybody minting their own token against
 * a hard-coded fallback.
 */
function edgeSecret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.trim().length < MIN_SECRET_LENGTH) return null;
  if (raw.includes("change-me") || raw.includes("dev-insecure")) return null;
  return new TextEncoder().encode(raw);
}

async function isValidAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = edgeSecret();
  if (!secret) {
    console.error("[middleware] AUTH_SECRET missing or too weak — denying admin access.");
    return false;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "ADMIN" || payload.role === "STAFF";
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin area — own auth guard, not localized.
  if (pathname.startsWith("/admin")) {
    // Sign-in and password recovery are the only unauthenticated admin routes.
    if (["/admin/login", "/admin/forgot", "/admin/reset"].includes(pathname)) {
      return NextResponse.next();
    }
    const ok = await isValidAdmin(req.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) {
      // A Server Action POST must not be redirected. The browser replays the
      // POST against /admin/login, that route knows nothing about the action
      // id, and the dashboard reports "Server Action ... was not found on the
      // server" instead of "your session expired". Let it reach the action,
      // which re-reads the session from the database and refuses on its own —
      // no mutation runs without a verified admin either way.
      if (req.headers.get("next-action")) return NextResponse.next();

      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Storefront — internationalized routing.
  const res = intlMiddleware(req);

  // Pre-launch: SITE_INDEXING is "off" (or unset) until the catalogue is ready
  // to be found, or "home" while only the homepage is. The header reaches
  // every storefront response, including ones whose metadata a page forgot to
  // set, and is read by crawlers the same way as a meta robots tag. Crawling
  // itself stays allowed in robots.txt so this can be read.
  const mode = (process.env.SITE_INDEXING || "").trim().toLowerCase();
  const isHome = pathname === "/" || pathname === "/fr" || pathname === "/fr/";
  if (mode !== "all" && !(mode === "home" && isHome)) {
    res.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return res;
}

export const config = {
  // Skip Next internals, API routes, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
