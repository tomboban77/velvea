import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LOCALES, DEFAULT_LOCALE } from "./locales";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // English lives at "/", French at "/fr"
  localePrefix: "as-needed",
  // hreflang is declared per page in metadata (src/lib/seo.ts) with en-CA /
  // fr-CA codes, and omitted for pages whose translation is not ready. The
  // automatic Link headers would use plain "en"/"fr" for every route and
  // contradict that, so they are off.
  alternateLinks: false,
  // No Accept-Language redirects: "/" must always serve the same English page
  // so crawlers and users share one canonical URL. The switcher in the header
  // and footer is a real link to the other locale.
  localeDetection: false,
});

export type { Locale } from "./locales";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
