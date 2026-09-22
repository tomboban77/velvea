import { describe, expect, it, vi } from "vitest";
import type { DeliveryZone } from "@prisma/client";
import { CITIES, CITY_PAGES, cityBySlug, formatCutoff, offerFor } from "@/lib/cities";
import { buildSitemap } from "@/lib/seo";

// cities.ts → zones.ts → prisma. Nothing here touches the client.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

/**
 * The city delivery pages promise nothing themselves: every fee and cutoff is
 * looked up from the zones. These tests pin the lookup and the data hygiene
 * that keeps a page per city from turning into a doorway-page farm.
 */

function zone(over: Partial<DeliveryZone>): DeliveryZone {
  return {
    id: over.key ?? "z",
    key: "z",
    name: { en: "Zone", fr: "Zone" },
    kind: "LOCAL",
    fsaPrefixes: [],
    fsaLetters: [],
    provinces: ["ON"],
    baseFeeCents: 999,
    extraItemCents: 0,
    sameDaySurchargeCents: 500,
    freeThresholdCents: null,
    sameDayCutoff: "16:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 0,
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...over,
  } as DeliveryZone;
}

const zones: DeliveryZone[] = [
  zone({ key: "local-a", fsaPrefixes: ["L5B", "L4Z"], sameDayCutoff: "16:00" }),
  zone({ key: "local-b", fsaLetters: ["M"], sameDayCutoff: "13:00", baseFeeCents: 1499, sameDaySurchargeCents: 700, position: 1 }),
  zone({ key: "local-c", fsaPrefixes: ["L7L", "L1V"], sameDayCutoff: null, baseFeeCents: 1999, minLeadDays: 1, maxLeadDays: 2, position: 2 }),
  zone({ key: "on-ground", kind: "SHIPPING", fsaLetters: ["K", "L", "N"], sameDayCutoff: null, baseFeeCents: 1999, minLeadDays: 2, maxLeadDays: 3, position: 3 }),
  zone({ key: "quote", kind: "QUOTE", fsaPrefixes: ["P0L"], position: 4 }),
];

describe("city data", () => {
  it("has unique slugs and valid FSAs", () => {
    const slugs = CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of CITIES) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
      expect(c.sampleFsa).toMatch(/^[A-Z]\d[A-Z]$/);
      for (const f of c.fsas) expect(f).toMatch(/^[A-Z]\d?[A-Z]?$/);
    }
  });

  it("gives every page city its own intro and areas in both languages", () => {
    const intros = new Set<string>();
    for (const c of CITY_PAGES) {
      expect(c.intro.en.length).toBeGreaterThan(200);
      expect(c.intro.fr.length).toBeGreaterThan(200);
      expect(c.intro.en).not.toBe(c.intro.fr);
      expect(c.areas.en.length).toBeGreaterThan(0);
      intros.add(c.intro.en);
    }
    // Identical intros with a swapped city name are what gets a site demoted.
    expect(intros.size).toBe(CITY_PAGES.length);
  });

  it("looks cities up by slug", () => {
    expect(cityBySlug("brampton")?.name.en).toBe("Brampton");
    expect(cityBySlug("nowhere")).toBeUndefined();
  });
});

describe("offerFor", () => {
  it("reports same-day with the zone's own cutoff", () => {
    const offer = offerFor(cityBySlug("mississauga")!, zones);
    expect(offer).toMatchObject({ kind: "same-day", cutoff: "16:00" });
    const toronto = offerFor(cityBySlug("toronto")!, zones);
    expect(toronto).toMatchObject({ kind: "same-day", cutoff: "13:00" });
    expect((toronto as { zone: DeliveryZone }).zone.baseFeeCents).toBe(1499);
  });

  it("reports next-day for a local zone without a cutoff", () => {
    expect(offerFor(cityBySlug("burlington")!, zones)).toMatchObject({ kind: "next-day" });
    expect(offerFor(cityBySlug("pickering")!, zones)).toMatchObject({ kind: "next-day" });
  });

  it("falls through to courier shipping and honours quote zones", () => {
    expect(offerFor(cityBySlug("guelph")!, zones)).toMatchObject({ kind: "shipping" });
    expect(offerFor({ ...cityBySlug("guelph")!, sampleFsa: "P0L" }, zones)).toEqual({ kind: "quote" });
  });

  it("follows a zone edit: moving Burlington's FSA into a same-day zone flips the offer", () => {
    const edited = zones.map((z) => (z.key === "local-b" ? { ...z, fsaPrefixes: ["L7L"] } : z.key === "local-c" ? { ...z, fsaPrefixes: ["L1V"] } : z));
    expect(offerFor(cityBySlug("burlington")!, edited)).toMatchObject({ kind: "same-day", cutoff: "13:00" });
  });

  it("returns unserved when no zone matches", () => {
    expect(offerFor(cityBySlug("mississauga")!, [])).toEqual({ kind: "unserved" });
  });
});

describe("formatCutoff", () => {
  it("formats store time for each locale", () => {
    expect(formatCutoff("16:00", "en")).toBe("4:00 p.m.");
    expect(formatCutoff("13:30", "en")).toBe("1:30 p.m.");
    expect(formatCutoff("09:00", "en")).toBe("9:00 a.m.");
    expect(formatCutoff("16:00", "fr")).toBe("16 h");
    expect(formatCutoff("13:30", "fr")).toBe("13 h 30");
    expect(formatCutoff("bad", "en")).toBe("bad");
  });
});

describe("sitemap city entries", () => {
  it("lists every city page in both locales", () => {
    const map = buildSitemap({
      origin: "https://www.velvea.ca",
      mode: "all",
      products: [],
      articles: [],
      collections: [],
      extraPaths: CITY_PAGES.map((c) => `/delivery/${c.slug}`),
    });
    const urls = map.map((e) => e.url);
    expect(urls).toContain("https://www.velvea.ca/delivery");
    expect(urls).toContain("https://www.velvea.ca/delivery/brampton");
    expect(urls).toContain("https://www.velvea.ca/fr/delivery/brampton");
    expect(urls).not.toContain("https://www.velvea.ca/delivery/hamilton");
  });
});
