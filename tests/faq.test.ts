import { describe, expect, it } from "vitest";

import en from "../messages/en.json";
import fr from "../messages/fr.json";
import { resolveFaqItems, type FaqItem } from "@/lib/faq";
import { CUSTOM_BUILDER_ENABLED } from "@/lib/features";

/**
 * The FAQ answered "hand-pick every item in our builder" for the whole time the
 * builder was paused, sending customers to a page that 404s — and, because the
 * /faq page builds its FAQPage JSON-LD from the same list, telling search
 * engines the same thing. These tests are the guard: a paused feature must
 * disappear from the copy that describes it, not only from the navigation.
 */

const enItems = en.faq.items as FaqItem[];
const frItems = fr.faq.items as FaqItem[];

describe("FAQ answers follow the feature flags", () => {
  it("resolves every item to exactly one answer", () => {
    for (const items of [enItems, frItems]) {
      const resolved = resolveFaqItems(items);
      expect(resolved).toHaveLength(items.length);
      for (const item of resolved) {
        expect(typeof item.q).toBe("string");
        expect(item.a.length).toBeGreaterThan(0);
        // The flag-specific variant must not leak through to a consumer.
        expect(item).not.toHaveProperty("aBuilder");
      }
    }
  });

  it("picks the answer matching the live builder state", () => {
    for (const items of [enItems, frItems]) {
      const resolved = resolveFaqItems(items);
      items.forEach((raw, i) => {
        const expected = CUSTOM_BUILDER_ENABLED && raw.aBuilder ? raw.aBuilder : raw.a;
        expect(resolved[i].a).toBe(expected);
      });
    }
  });

  it("never serves a builder answer while the builder is paused", () => {
    if (CUSTOM_BUILDER_ENABLED) return;
    for (const items of [enItems, frItems]) {
      const answers = resolveFaqItems(items).map((i) => i.a);
      const builderAnswers = items.map((i) => i.aBuilder).filter(Boolean);
      // There is one to suppress, and none of them may reach a reader.
      expect(builderAnswers.length).toBeGreaterThan(0);
      for (const a of builderAnswers) expect(answers).not.toContain(a);
    }
    expect(resolveFaqItems(enItems).some((i) => /\bbuilder\b/i.test(i.a))).toBe(false);
  });

  it("keeps the flagged answers in step across locales", () => {
    const enFlagged = enItems.map((i) => Boolean(i.aBuilder));
    const frFlagged = frItems.map((i) => Boolean(i.aBuilder));
    // A variant in one language only would swap the answer in EN and leave the
    // stale promise standing in FR.
    expect(frFlagged).toEqual(enFlagged);
  });

  it("falls back to the plain answer when an item has no variant", () => {
    const resolved = resolveFaqItems([{ q: "Q", a: "plain" }]);
    expect(resolved).toEqual([{ q: "Q", a: "plain" }]);
  });
});
