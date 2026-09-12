import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { fontVars } from "@/lib/fonts";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Velvea — Premium Gift Baskets Delivered Across Canada",
    template: "%s · Velvea",
  },
  description:
    "Premium gift baskets, hand-packed in Mississauga and delivered across Canada. Same-day delivery in the GTA on eligible orders.",
  keywords: [
    "gift baskets Canada",
    "gift baskets Mississauga",
    "gourmet gift baskets",
    "corporate gifts Canada",
    "same-day gift delivery GTA",
  ],
  openGraph: {
    type: "website",
    siteName: "Velvea",
    title: "Velvea — Premium Gift Baskets Delivered Across Canada",
    description:
      "Beautiful, hand-packed gift baskets for every occasion, delivered across Canada.",
    images: ["/brand/velvea-logo.png?v=3"],
  },
  icons: { icon: "/favicon.ico" },
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
      <body>{children}</body>
    </html>
  );
}
