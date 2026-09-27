import type { ArticleCategory } from "@prisma/client";

/** One guide, ready to upsert. Every text field is bilingual. */
export type GuideSeed = {
  slug: string;
  category: ArticleCategory;
  readMinutes: number;
  featured: boolean;
  title: { en: string; fr: string };
  excerpt: { en: string; fr: string };
  seoTitle: { en: string; fr: string };
  seoDescription: { en: string; fr: string };
  /**
   * Sanitised HTML, not markdown — the guide page renders the body with
   * `dangerouslySetInnerHTML` through `sanitizeHtml()`. Only the tags on that
   * allow-list survive, and the only attributes kept anywhere are `href`/`title`
   * on links, so there is no point writing classes or inline styles.
   *
   * Links in the French body carry the `/fr` prefix: the body renders inside
   * the French route, and a bare `/baskets` would drop the reader into English.
   */
  body: { en: string; fr: string };
};
