import { describe, expect, it } from "vitest";
import { OCCASION_SEO, fillOccasion, joinNames, occasionSeo, resolveOccasionFaq, resolveOccasionIntro } from "@/lib/occasion-seo";
import { HOLIDAYS, OCCASIONS } from "@/lib/nav";

/**
 * The occasion pages carry written copy that quotes the same-day cutoff, the
 * local fee and the list of same-day cities. These tests pin the data hygiene:
 * every entry maps to a real occasion, has both languages, and anything that
 * promises same-day disappears cleanly when the zone has no cutoff instead of
 * publishing a sentence with a hole in it.
 */

const slugs = new Set([...OCCASIONS, ...HOLIDAYS].map((o) => o.slug));
const facts = { cutoff: "12:00 p.m.", fee: "$9.99", cities: "Mississauga, Toronto and Brampton" };
const noSameDay = { cities: "Mississauga, Toronto and Brampton" };

describe("occasion editorial content", () => {
  it("covers the searched-for occasions and nothing that is not in the nav", () => {
    for (const key of ["christmas", "birthday", "milestone-birthday", "anniversary", "proposal", "wedding", "real-estate-closing", "holiday"]) {
      expect(occasionSeo(key), key).toBeDefined();
    }
    for (const entry of OCCASION_SEO) expect(slugs.has(entry.slug), entry.slug).toBe(true);
    expect(new Set(OCCASION_SEO.map((o) => o.slug)).size).toBe(OCCASION_SEO.length);
  });

  it("has distinct, non-empty copy in both languages", () => {
    const titles = new Set<string>();
    for (const entry of OCCASION_SEO) {
      for (const lang of ["en", "fr"] as const) {
        expect(entry.title[lang].length).toBeGreaterThan(20);
        expect(entry.description[lang].length).toBeGreaterThan(80);
        expect(entry.description[lang].length, `${entry.slug} ${lang} description too long`).toBeLessThan(230);
        expect(entry.heading[lang].length).toBeGreaterThan(10);
        expect(entry.intro[lang].length).toBeGreaterThanOrEqual(2);
        for (const p of entry.intro[lang]) expect(p.length).toBeGreaterThan(120);
        expect(entry.faq.length).toBeGreaterThanOrEqual(3);
        titles.add(entry.title[lang]);
      }
      // The brand is appended by the layout template; a title that already
      // names it would render "… Velvéa · Velvéa".
      expect(entry.title.en).not.toMatch(/velv[ée]a/i);
      expect(entry.title.fr).not.toMatch(/velv[ée]a/i);
    }
    expect(titles.size).toBe(OCCASION_SEO.length * 2);
  });

  it("uses only known placeholders, identically in EN and FR", () => {
    const names = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
    for (const entry of OCCASION_SEO) {
      const all = [
        ...entry.intro.en.map((p, i) => [p, entry.intro.fr[i]] as const),
        ...entry.faq.map((f) => [f.a.en, f.a.fr] as const),
        ...entry.faq.map((f) => [f.q.en, f.q.fr] as const),
      ];
      for (const [en, fr] of all) {
        for (const n of names(en)) expect(["{cutoff}", "{fee}", "{cities}"], `${entry.slug}: ${n}`).toContain(n);
        expect(names(fr), `${entry.slug}: EN/FR placeholders differ`).toEqual(names(en));
      }
    }
  });

  it("marks every FAQ that quotes the cutoff as needing same-day", () => {
    for (const entry of OCCASION_SEO) {
      for (const f of entry.faq) {
        if (f.a.en.includes("{cutoff}") || f.a.fr.includes("{cutoff}")) expect(f.needs, `${entry.slug}: "${f.q.en}"`).toBe("same-day");
      }
    }
  });

  it("fills the facts into the copy and never leaves a brace behind", () => {
    for (const entry of OCCASION_SEO) {
      for (const locale of ["en", "fr"]) {
        const text = [...resolveOccasionIntro(entry, locale, facts), ...resolveOccasionFaq(entry, locale, facts).flatMap((f) => [f.q, f.a])].join("\n");
        expect(text).not.toMatch(/[{}]/);
        expect(text).toContain("12:00 p.m.");
      }
    }
  });

  it("drops same-day promises when the zone has no cutoff", () => {
    const christmas = occasionSeo("christmas")!;
    const intro = resolveOccasionIntro(christmas, "en", noSameDay);
    const faq = resolveOccasionFaq(christmas, "en", noSameDay);
    const text = [...intro, ...faq.flatMap((f) => [f.q, f.a])].join("\n");
    expect(text).not.toMatch(/[{}]/);
    expect(text).not.toMatch(/order before\s+Eastern/i);
    expect(faq.length).toBeLessThan(christmas.faq.length);
    expect(intro.length).toBeLessThan(christmas.intro.en.length);
  });

  it("joins city names the way each language reads", () => {
    expect(joinNames(["Mississauga", "Toronto", "Brampton"], "en")).toBe("Mississauga, Toronto and Brampton");
    expect(joinNames(["Mississauga", "Toronto"], "fr")).toBe("Mississauga et Toronto");
    expect(joinNames(["Mississauga"], "en")).toBe("Mississauga");
    expect(fillOccasion("by {cutoff} for {fee} in {cities}", facts)).toBe("by 12:00 p.m. for $9.99 in Mississauga, Toronto and Brampton");
  });
});
