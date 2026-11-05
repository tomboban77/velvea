import { describe, expect, it } from "vitest";
import {
  checkCityForPostal,
  isKnownLocalFsa,
  isKnownLocalLetter,
  normalizeCity,
  normalizePostalCode,
} from "@/lib/address-check";
import { ZONE_SEED } from "../prisma/zones";

describe("normalizePostalCode", () => {
  it("accepts a full code however it is typed", () => {
    expect(normalizePostalCode("l5b1m2")).toBe("L5B 1M2");
    expect(normalizePostalCode(" L5B-1M2 ")).toBe("L5B 1M2");
  });

  it("refuses partial codes and letters Canada Post never uses", () => {
    expect(normalizePostalCode("L5B")).toBeNull();
    expect(normalizePostalCode("L5B 1M")).toBeNull();
    expect(normalizePostalCode("L5D 1M2")).toBeNull();
    expect(normalizePostalCode("W5B 1M2")).toBeNull();
    expect(normalizePostalCode("90210")).toBeNull();
  });
});

describe("normalizeCity", () => {
  it("ignores case, accents, punctuation and a trailing province", () => {
    expect(normalizeCity("Mississauga, ON")).toBe("mississauga");
    expect(normalizeCity("richmond hill ontario")).toBe("richmondhill");
    expect(normalizeCity("Whitchurch–Stouffville")).toBe("whitchurchstouffville");
  });
});

describe("checkCityForPostal", () => {
  it("accepts the city a local postal code belongs to", () => {
    expect(checkCityForPostal("Mississauga", "L5B", true)).toEqual({ ok: true });
    expect(checkCityForPostal("Scarborough", "M1B", true)).toEqual({ ok: true });
    expect(checkCityForPostal("Woodbridge", "L4L", true)).toEqual({ ok: true });
    expect(checkCityForPostal("Thornhill", "L3T", true)).toEqual({ ok: true });
  });

  it("refuses a cheaper zone's postal code on an address in another city", () => {
    expect(checkCityForPostal("Oshawa", "L5B", true)).toEqual({
      ok: false,
      reason: "mismatch",
      expected: ["Mississauga"],
    });
    // Toronto is the M letter, except the airport FSA, which is Mississauga.
    expect(checkCityForPostal("Toronto", "M7R", true)).toMatchObject({ reason: "mismatch" });
  });

  it("only accepts a neighbourhood name in the FSAs it sits in", () => {
    expect(checkCityForPostal("Bolton", "L7E", true)).toEqual({ ok: true });
    expect(checkCityForPostal("Bolton", "L7C", true)).toMatchObject({ reason: "mismatch" });
    expect(checkCityForPostal("Caledon", "L7C", true)).toEqual({ ok: true });
  });

  it("refuses a local zone FSA it has no city names for", () => {
    expect(checkCityForPostal("Anywhere", "L9W", true)).toEqual({ ok: false, reason: "unknown-local" });
  });

  it("refuses a GTA-only city name with a postal code from elsewhere", () => {
    expect(checkCityForPostal("Toronto", "K1A", false)).toEqual({
      ok: false,
      reason: "wrong-postal",
      city: "Toronto",
    });
  });

  it("leaves shipped addresses elsewhere alone", () => {
    expect(checkCityForPostal("Ottawa", "K1A", false)).toEqual({ ok: true });
    // Milton also exists in Nova Scotia.
    expect(checkCityForPostal("Milton", "B0T", false)).toEqual({ ok: true });
  });
});

describe("local zone coverage", () => {
  // Checkout refuses a local FSA with no city names, so a seeded zone that the
  // list doesn't cover would turn every order there away.
  it("knows the city names for every FSA a seeded local zone serves", () => {
    for (const zone of ZONE_SEED.filter((z) => z.kind === "LOCAL")) {
      for (const fsa of (zone.fsaPrefixes as string[] | undefined) ?? []) {
        expect(isKnownLocalFsa(fsa), `${zone.key} ${fsa}`).toBe(true);
      }
      for (const letter of (zone.fsaLetters as string[] | undefined) ?? []) {
        expect(isKnownLocalLetter(letter), `${zone.key} ${letter}`).toBe(true);
      }
    }
  });
});
