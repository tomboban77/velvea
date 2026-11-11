"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isTrackedUrl } from "@/lib/analytics-host";

/**
 * Admin pages are the owner and staff at work, not shoppers. Left in, they made
 * up about a third of the "visitors" and skewed Speed Insights toward pages no
 * customer sees.
 */
function isAdmin(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith("/admin");
  } catch {
    return false;
  }
}

/**
 * Only storefront views on the public domain are sent. Anything opened through
 * Vercel (preview deployments, the `*.vercel.app` production alias) is dropped
 * so checking a build does not show up as a visit. See lib/analytics-host.ts.
 */
function keep(url: string): boolean {
  return isTrackedUrl(url) && !isAdmin(url);
}

/** Vercel Analytics + Speed Insights, storefront only. Both no-op outside a Vercel deployment. */
export function VercelAnalytics() {
  return (
    <>
      <Analytics beforeSend={(event: BeforeSendEvent) => (keep(event.url) ? event : null)} />
      <SpeedInsights beforeSend={(data) => (keep(data.url) ? data : null)} />
    </>
  );
}
