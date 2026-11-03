import { describe, expect, it } from "vitest";
import { containsFlowers } from "@/lib/flowers";

// Item lines taken from the live catalogue.
describe("containsFlowers", () => {
  it.each([
    "Fresh red roses",
    "Fresh orange gerbera flowers",
    "Fresh white baby's breath flowers",
    "Fresh yellow lilies",
    "Pink and ivory decorative roses",
    "Decorative Red Roses and White Accent Flowers",
    "Pink and ivory floral arrangement",
    "Premium white and navy floral arrangement",
    "Gold gift box with cream filler and white floral accents",
    "Woven presentation basket with floral styling",
  ])("counts %s", (item) => {
    expect(containsFlowers(["Lindt LINDOR Truffles (156 g)", item])).toBe(true);
  });

  it.each([
    "Bath & Body Works Covered in Roses Mini Eau de Parfum",
    "Rose Hibiscus Herbal Tea",
    "Fior Fiore Chilli-Flavoured Olive & Sunflower Oil Blend (250 mL)",
    "SEPHORA COLLECTION Rose Hand Care",
    "Baby socks, pack of 3 (pink, white and pink stripe), pink bunny and floral design",
    "Laurieri Scrocchi Rosemary Crackers (175 g)",
  ])("ignores %s", (item) => {
    expect(containsFlowers([item])).toBe(false);
  });

  it("always counts the Flowers category", () => {
    expect(containsFlowers([], true)).toBe(true);
  });
});
