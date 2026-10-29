import "server-only";
import { after } from "next/server";
import { LOCALES } from "@/i18n/locales";
import { absoluteUrl, siteOrigin } from "./seo";

/**
 * IndexNow (indexnow.org): tells Bing, Yandex, Seznam and Naver that a URL
 * changed, so they recrawl in hours instead of whenever they next pass. Bing's
 * index is what Copilot and much of ChatGPT search answer from, which is why
 * this exists. Google does not take part; the sitemap covers Google.
 *
 * Off unless INDEXNOW_KEY is set, and only from the production deployment: a
 * preview build pinging with production URLs would announce changes that are
 * not live. The key is served at /indexnow.txt (src/app/indexnow.txt/route.ts)
 * and passed as keyLocation, so no file has to be named after it.
 *
 * Acceptance (200/202) only means the ping was received, not that anything
 * was indexed. Failures are logged and dropped: a missed ping costs a slower
 * recrawl, never a failed admin save.
 */
export function indexNowKey(env: NodeJS.ProcessEnv = process.env): string | null {
  const key = env.INDEXNOW_KEY?.trim();
  // The protocol allows 8–128 characters of a-z, A-Z, 0-9 and dashes.
  return key && /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : null;
}

export function indexNowPayload(paths: string[], key: string, origin: string) {
  const urlList = [...new Set(paths.flatMap((p) => LOCALES.map((l) => absoluteUrl(l, p, origin))))];
  return { host: new URL(origin).host, key, keyLocation: `${origin}/indexnow.txt`, urlList };
}

/** Schedules the ping after the response is sent. Paths are unprefixed ("/products/x"); both locales go. */
export function notifyIndexNow(paths: string[]): void {
  const key = indexNowKey();
  if (!key || process.env.VERCEL_ENV !== "production" || paths.length === 0) return;
  const payload = indexNowPayload(paths, key, siteOrigin());
  after(async () => {
    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok && res.status !== 202) console.warn(`[indexnow] ${res.status} for ${payload.urlList.length} URLs`);
    } catch (err) {
      console.warn("[indexnow] ping failed", err);
    }
  });
}
