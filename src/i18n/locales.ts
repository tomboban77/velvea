/**
 * Locale constants with no dependencies, so modules that only need the list
 * (SEO helpers, tests, the edge middleware) do not pull in next-intl's
 * navigation runtime. `routing.ts` builds the next-intl config from these.
 */
export const LOCALES = ["en", "fr"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export type Locale = (typeof LOCALES)[number];
