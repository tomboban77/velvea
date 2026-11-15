import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GIFT_STYLES, getGiftStyle, showsGiftStyles, styleFromLabel, styleRequestLabel } from "@/lib/gift-styles";

describe("gift styles", () => {
  it("has unique slugs and unique reference codes", () => {
    const slugs = GIFT_STYLES.map((s) => s.slug);
    const codes = GIFT_STYLES.map((s) => s.code);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c).toMatch(/^VS-\d{2}$/);
  });

  it("ships an image file for every style", () => {
    for (const s of GIFT_STYLES) {
      expect(existsSync(join(process.cwd(), "public", s.image.src)), s.image.src).toBe(true);
    }
  });

  it("has English and French for every piece of copy", () => {
    for (const s of GIFT_STYLES) {
      for (const text of [s.name, s.summary, ...s.ideas]) {
        expect(text.en.trim()).not.toBe("");
        expect(text.fr.trim()).not.toBe("");
      }
    }
  });

  it("looks styles up by slug", () => {
    expect(getGiftStyle("favourites-tray")?.name.en).toBe("Favourites Tray");
    expect(getGiftStyle("nope")).toBeNull();
    expect(getGiftStyle(undefined)).toBeNull();
  });

  it("shows on personal occasions and recipients, not on sympathy", () => {
    for (const slug of ["anniversary", "birthday", "valentines", "for-her", "for-him"]) {
      expect(showsGiftStyles(slug)).toBe(true);
    }
    expect(showsGiftStyles("sympathy")).toBe(false);
  });

  it("reads a stored label back to the style, for every style", () => {
    for (const style of GIFT_STYLES) {
      expect(styleFromLabel(styleRequestLabel(style))).toEqual({ code: style.code, name: style.name.en, style });
    }
  });

  it("keeps the code and name of a retired style, and leaves basket names alone", () => {
    expect(styleFromLabel("Style VS-99: Old Look")).toEqual({ code: "VS-99", name: "Old Look", style: null });
    expect(styleFromLabel("Coffee Comfort Basket")).toBeNull();
    expect(styleFromLabel(null)).toBeNull();
  });
});
