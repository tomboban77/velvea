import Script from "next/script";

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
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script
        id="ga-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true});`,
        }}
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`} strategy="afterInteractive" />
    </>
  );
}
