/**
 * Which hostnames count as real traffic.
 *
 * Vercel serves every deployment on its own `*.vercel.app` URL as well as the
 * custom domain, and the owner opens those links from the Vercel dashboard
 * to check a build. Those visits (and localhost) were landing in Vercel
 * Analytics and GA4 as if they were shoppers, so both trackers only report
 * from the public domain. Derived from NEXT_PUBLIC_SITE_URL (inlined at build
 * time, so it is also available in the browser) and accepts the bare apex as
 * well as the `www.` host in case a visitor arrives before the redirect.
 */
export function trackedHosts(siteUrl = process.env.NEXT_PUBLIC_SITE_URL): string[] {
  let host = "";
  try {
    host = new URL((siteUrl || "").trim()).hostname.toLowerCase();
  } catch {
    host = "";
  }
  if (!host || host === "localhost" || host === "127.0.0.1") return [];
  const apex = host.replace(/^www\./, "");
  return Array.from(new Set([host, apex, `www.${apex}`]));
}

export function isTrackedHost(hostname: string, siteUrl?: string): boolean {
  return trackedHosts(siteUrl).includes(hostname.toLowerCase());
}

/** Same check for a full URL, as Vercel's beforeSend hooks receive it. */
export function isTrackedUrl(url: string, siteUrl?: string): boolean {
  try {
    return isTrackedHost(new URL(url).hostname, siteUrl);
  } catch {
    return false;
  }
}
