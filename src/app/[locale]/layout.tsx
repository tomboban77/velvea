import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header, type HeaderFeatured } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { getFeaturedProducts, getBestsellers } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // One product for the mega-menu "Featured now" tile.
  const [featured] = await getFeaturedProducts(1);
  const pick = featured ?? (await getBestsellers(1))[0];
  const headerFeatured: HeaderFeatured = pick
    ? {
        slug: pick.slug,
        name: tc(pick.name, locale),
        image: pick.images[0]?.url ?? null,
        priceCents: pick.priceCents,
      }
    : null;

  return (
    <NextIntlClientProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <a href="#main-content" className="skip-link">{locale === "fr" ? "Aller au contenu" : "Skip to content"}</a>
          <Header featured={headerFeatured} />
          <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
        <ScrollToTop />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
