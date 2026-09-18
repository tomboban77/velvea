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
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Storefront — internationalized routing.
  return intlMiddleware(req);
}

export const config = {
  // Skip Next internals, API routes, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
