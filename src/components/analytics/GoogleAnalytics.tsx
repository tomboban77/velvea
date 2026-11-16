import Script from "next/script";
import { trackedHosts } from "@/lib/analytics-host";

/** GA4 measurement id ("G-XXXXXXX"). Unset = Google Analytics is not loaded at all. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;

/** localStorage key holding the visitor's choice; shared with <ConsentBanner>. */
export const CONSENT_KEY = "velvea_consent";

/**
 * Google Analytics 4, loaded only after the visitor accepts.
 *
 * Until 15 Nov 2026 the tag loaded for everyone with Consent Mode signals
 * denied, which still sent cookieless pings to Google before any choice was
 * made. Quebec's Law 25 requires analytics to be off until the visitor opts
 * in, and shipping to Quebec opened that day, so now nothing is fetched and
 * nothing is sent until consent: this script only defines `velveaLoadGa`, and
 * runs it straight away for a browser that accepted on an earlier visit.
 * <ConsentBanner> calls it when the visitor clicks Accept.
 *
 * The cost is deliberate: visitors who decline or ignore the banner no longer
 * appear in GA at all. Vercel Analytics (cookieless, first-party) still counts
 * every page view. Ad signals stay denied permanently: this is measurement,
 * not advertising. Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset.
 *
 * The page is served on Vercel's own `*.vercel.app` URLs too (previews and the
 * production alias the owner opens from the dashboard). The hostname check
 * runs in the browser, since the layout is static and cannot see the request
 * host: off the public domain the loader is never defined, so those visits do
 * not reach GA whatever the banner says.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  const hosts = JSON.stringify(trackedHosts());
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  return (
    <Script
      id="ga-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `if(${hosts}.indexOf(location.hostname.toLowerCase())!==-1){
window.velveaLoadGa=function(){if(window.gtag)return;
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true});
var s=document.createElement('script');s.async=true;s.src=${JSON.stringify(src)};document.head.appendChild(s);};
try{if(localStorage.getItem('${CONSENT_KEY}')==='granted')window.velveaLoadGa();}catch(e){}}`,
      }}
    />
  );
}
