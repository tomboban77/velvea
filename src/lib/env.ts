import "server-only";
import { siteOrigin } from "@/lib/seo";

/**
 * Fail-fast environment checks.
 *
 * Anything that can mint a session or move money must be configured explicitly;
 * silent fallbacks are how a dev secret ends up signing production admin tokens.
 */

const MIN_SECRET_LENGTH = 32;
const isProd = process.env.NODE_ENV === "production";

let cachedSecret: Uint8Array | null = null;

/** The AUTH_SECRET as raw bytes. Throws if missing or too short. */
export function authSecretBytes(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.trim().length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters. ` +
        "Generate one with: openssl rand -base64 32"
    );
  }
  if (raw.includes("change-me") || raw.includes("dev-insecure")) {
    throw new Error("AUTH_SECRET is still the placeholder value. Generate a real secret.");
  }
  cachedSecret = new TextEncoder().encode(raw);
  return cachedSecret;
}

/** True when the operator has explicitly allowed orders without a payment. */
export function offlineOrdersAllowed(): boolean {
  return process.env.ALLOW_OFFLINE_ORDERS === "true";
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Called once at startup (instrumentation) so a misconfigured deploy fails
 * loudly instead of at the first checkout.
 */
export function assertStartupEnv(): void {
  const problems: string[] = [];

  try {
    authSecretBytes();
  } catch (err) {
    problems.push((err as Error).message);
  }

  if (isProd) {
    if (!process.env.DATABASE_URL) problems.push("DATABASE_URL is not set.");
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
      problems.push(
        "STRIPE_WEBHOOK_SECRET is required whenever STRIPE_SECRET_KEY is set — " +
          "unsigned webhooks are rejected."
      );
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      problems.push("NEXT_PUBLIC_SITE_URL is not set (used for Stripe redirects and email links).");
    } else {
      // A localhost or http origin here would become every canonical URL,
      // sitemap entry and Open Graph URL on the live site.
      try {
        siteOrigin();
      } catch (err) {
        problems.push((err as Error).message);
      }
    }
    if (!process.env.SITE_INDEXING) {
      // Not an error: the closed default is deliberate. Logged so nobody
      // wonders why Google is not indexing the site after launch.
      console.warn("[env] SITE_INDEXING is unset — every storefront page is noindex. Set SITE_INDEXING=all to launch.");
    }
    if (offlineOrdersAllowed() && process.env.STRIPE_SECRET_KEY) {
      problems.push(
        "ALLOW_OFFLINE_ORDERS must not be enabled while Stripe is configured."
      );
    }
  }

  if (problems.length) {
    const message = "Invalid environment:\n  - " + problems.join("\n  - ");
    if (isProd) throw new Error(message);
    console.warn(`[env] ${message}`);
  }
}
