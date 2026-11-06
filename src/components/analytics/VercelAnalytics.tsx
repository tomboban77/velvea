"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

/** Vercel Analytics + Speed Insights, storefront only. Both no-op outside a Vercel deployment. */
export function VercelAnalytics() {
  return (
    <>
      <Analytics beforeSend={(event: BeforeSendEvent) => (isAdmin(event.url) ? null : event)} />
      <SpeedInsights beforeSend={(data) => (isAdmin(data.url) ? null : data)} />
    </>
  );
}
