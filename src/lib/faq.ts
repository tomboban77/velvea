import { CUSTOM_BUILDER_ENABLED } from "@/lib/features";

/**
 * A FAQ entry from the message catalogue. `aBuilder` is the answer to use only
 * while the custom basket builder is live; without it the entry has one answer
 * in every state.
 */
export type FaqItem = { q: string; a: string; aBuilder?: string };

/**
 * The FAQ as it should actually be shown.
 *
 * "Can I build my own basket?" answered "Yes — hand-pick every item in our
 * builder" for the whole time CUSTOM_BUILDER_ENABLED was false, so the FAQ was
 * sending customers to a page that 404s. A paused feature has to disappear from
 * the copy that describes it, not only from the navigation.
 *
 * Both the storefront component and the /faq page's FAQPage JSON-LD resolve
 * through here, so the markup a search engine reads can never claim something
 * different from the answer a visitor sees.
 */
export function resolveFaqItems(raw: FaqItem[]): { q: string; a: string }[] {
  return raw.map(({ q, a, aBuilder }) => ({
    q,
    a: CUSTOM_BUILDER_ENABLED && aBuilder ? aBuilder : a,
  }));
}
