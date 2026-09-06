import type { Locale } from "@/i18n/routing";

export type LocalizedText = { en: string; fr: string };

/** Safely read a localized JSON value with graceful fallback to English. */
export function t(
  value: unknown,
  locale: Locale | string = "en"
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const v = value as Record<string, string>;
    return v[locale] ?? v.en ?? Object.values(v)[0] ?? "";
  }
  return "";
}

/** Localized array of texts, e.g. product contents. */
export function tList(value: unknown, locale: Locale | string = "en"): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => t(v, locale)).filter(Boolean);
}

/** Build a { en, fr } object, filling French from English when empty. */
export function localized(en: string, fr?: string): LocalizedText {
  return { en, fr: fr && fr.trim() ? fr : en };
}
