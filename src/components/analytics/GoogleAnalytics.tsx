import Script from "next/script";
import { trackedHosts } from "@/lib/analytics-host";

/** GA4 measurement id ("G-XXXXXXX"). Unset = Google Analytics is not loaded at all. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;

/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * The tag loads with every consent signal denied, so until the visitor accepts
 * in <ConsentBanner> GA receives only cookieless pings and sets no cookie —
 * that is what lets the privacy policy keep saying no tracking without consent.
 * Ad signals stay denied permanently: this is measurement, not advertising.
 * Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset.
 *
 * The page is served on Vercel's own `*.vercel.app` URLs too (previews and the
 * production alias the owner opens from the dashboard). The hostname check
 * runs in the browser, since the layout is static and cannot see the request
 * host: off the public domain nothing is configured and gtag.js is never
 * fetched, so those visits do not reach GA at all.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  const hosts = JSON.stringify(trackedHosts());
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  return (
    <Script
      id="ga-consent-default"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `if(${hosts}.indexOf(location.hostname.toLowerCase())!==-1){
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true});
var s=document.createElement('script');s.async=true;s.src=${JSON.stringify(src)};document.head.appendChild(s);}`,
      }}
    />
  );
}
