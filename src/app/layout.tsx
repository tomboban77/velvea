import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { fontVars } from "@/lib/fonts";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Velvea — Premium Gift Baskets Delivered Across Ontario",
    template: "%s · Velvea",
  },
  description:
    "Premium gift baskets, hand-packed in Mississauga and delivered across Ontario. Same-day delivery in the GTA on eligible orders.",
  keywords: [
    "gift baskets Ontario",
    "gift baskets Mississauga",
    "gourmet gift baskets",
    "corporate gifts Ontario",
    "same-day gift delivery GTA",
  ],
  openGraph: {
    type: "website",
    siteName: "Velvea",
    title: "Velvea — Premium Gift Baskets Delivered Across Ontario",
    description:
      "Beautiful, hand-packed gift baskets for every occasion, delivered across Ontario.",
    images: ["/brand/velvea-og.png?v=6"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6d288f",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
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
