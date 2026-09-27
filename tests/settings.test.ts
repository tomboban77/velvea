import { describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  setting: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

import { DEFAULT_SETTINGS } from "@/lib/settings";
import { organizationJsonLd } from "@/lib/seo";

/**
 * The social defaults are published twice — as the footer's buttons and as the
 * homepage Organization `sameAs` — so a placeholder handle links customers to an
 * account Velvéa does not own and points Google's entity signal at a profile
 * that never links back. A guessed URL once reached production this way; these
 * tests are the guard against it happening again.
 */
describe("social settings defaults", () => {
  it("ship empty rather than guessed profile URLs", () => {
    expect(Object.values(DEFAULT_SETTINGS.social).every((v) => v === "")).toBe(true);
  });

  it("keep unconfigured networks out of Organization sameAs", () => {
    const ld = organizationJsonLd({
      origin: "https://www.velvea.ca",
      contact: { email: "hi@velvea.ca", phone: "", addressLine: "" },
      sameAs: Object.values(DEFAULT_SETTINGS.social),
    }) as Record<string, unknown>;
    expect(ld.sameAs).toBeUndefined();
  });

  it("publish the verified Business Profile alongside the real accounts", () => {
    const ld = organizationJsonLd({
      origin: "https://www.velvea.ca",
      contact: { email: "hi@velvea.ca", phone: "", addressLine: "" },
      sameAs: Object.values({
        ...DEFAULT_SETTINGS.social,
        instagram: "https://www.instagram.com/velvea_gifts",
        googleBusiness: "https://maps.app.goo.gl/abc123?entry=ttu",
      }),
    }) as Record<string, unknown>;
    // The share link's tracking query is stripped, as for any other profile.
    expect(ld.sameAs).toEqual([
      "https://www.instagram.com/velvea_gifts",
      "https://maps.app.goo.gl/abc123",
    ]);
  });

  it("publish only the networks that are configured", () => {
    const ld = organizationJsonLd({
      origin: "https://www.velvea.ca",
      contact: { email: "hi@velvea.ca", phone: "", addressLine: "" },
      sameAs: Object.values({
        ...DEFAULT_SETTINGS.social,
        instagram: "https://www.instagram.com/velvea_gifts",
      }),
    }) as Record<string, unknown>;
    expect(ld.sameAs).toEqual(["https://www.instagram.com/velvea_gifts"]);
  });
});
