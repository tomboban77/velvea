/**
 * Content switches for the /corporate page, kept out of the page so changing a
 * season is a one-line edit.
 */

export type CorporateChapter = { type: "OCCASION" | "RECIPIENT" | "CATEGORY"; slug: string };

/**
 * The collections the corporate page sends buyers to, in display order. These
 * stand in for the printed catalogue a competitor offers as a PDF: every tile
 * reads its count, starting price and cover from the live collection, so it is
 * never out of date. A collection with no active products drops out on its own
 * (an empty collection is noindex, so we never link to one).
 */
export const CORPORATE_CHAPTERS: CorporateChapter[] = [
  { type: "OCCASION", slug: "holiday" },
  { type: "RECIPIENT", slug: "clients" },
  { type: "RECIPIENT", slug: "employees" },
  { type: "OCCASION", slug: "thank-you" },
  { type: "OCCASION", slug: "congratulations" },
  { type: "CATEGORY", slug: "gourmet" },
  { type: "CATEGORY", slug: "chocolate" },
  { type: "CATEGORY", slug: "spa-wellness" },
];

export function chapterPath(c: { type: string; slug: string }): string {
  const base = c.type === "OCCASION" ? "occasions" : c.type === "RECIPIENT" ? "recipients" : "category";
  return `/${base}/${c.slug}`;
}

/** The recipient-list spreadsheet, one per language (UTF-8 with BOM so Excel keeps the accents). */
export const BULK_FORM = {
  en: "/corporate/velvea-bulk-order-form.csv",
  fr: "/corporate/velvea-bon-de-commande-groupe.csv",
} as const;
