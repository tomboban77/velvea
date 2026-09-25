import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { fontVars } from "@/lib/fonts";
import { SPLASH_ENABLED } from "@/lib/features";
import { BRAND, DEFAULT_OG_IMAGE, siteOrigin } from "@/lib/seo";
import "./globals.css";

/**
 * Site-wide defaults only. Every storefront page sets its own title,
 * description, canonical, hreflang and Open Graph through `pageMetadata()` in
 * src/lib/seo.ts; what is here is the template and the fallbacks for routes
 * that do not (admin, root 404). Meta keywords are not emitted: Google has
 * ignored them for years and they only advertise the target terms.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: `${BRAND} — Gift Baskets & Hampers Delivered Across Ontario`,
    template: `%s · ${BRAND}`,
  },
  description:
    "Online gift shop for premium gift baskets, hampers and gift boxes, hand-packed in Mississauga and delivered across Ontario. Same-day delivery in the GTA on eligible orders.",
  openGraph: {
    type: "website",
    siteName: BRAND,
    images: [DEFAULT_OG_IMAGE],
  },
  // Ownership tokens for Search Console / Bing Webmaster (meta-tag method).
  // Only emitted when the env var is set, so nothing is claimed by accident.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#6d288f",
};

const PREPAINT = `(function(){var d=document.documentElement;d.classList.add('js');${
  SPLASH_ENABLED
    ? `try{var p=location.pathname;if(p!=='/admin'&&p.indexOf('/admin/')!==0&&!localStorage.getItem('velvea_splash')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-splash','1')}}catch(e){}`
    : ""
}})()`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <head>
        {/* Pre-paint, and it has to stay that way. The `js` class gates the
            scroll reveals; data-splash decides the first-load welcome (see
            src/components/brand/Splash.tsx). Deciding after hydration would
            mean painting the page, then covering it — so the decision happens
            here, in the first frame, and <Splash> only ever ends it.
            Skipped for the admin panel, for anyone who has already been
            greeted (localStorage, so once per browser rather than once per
            tab — a reload, a new tab or a restart must not greet them again),
            and for prefers-reduced-motion. */}
        <script
          dangerouslySetInnerHTML={{
            __html: PREPAINT,
          }}
        />
      </head>
      <body>
        {children}
        {/* Vercel Analytics: cookieless page views and referrers. Speed Insights:
            real-user Core Web Vitals. Both no-op outside a Vercel deployment. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
