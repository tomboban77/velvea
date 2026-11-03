/**
 * Whether a basket has flowers in it, read from its English contents list.
 *
 * Flowers are bought fresh for each order, so what goes in the box depends on
 * what the market has that week, and the product page has to say so. Reading
 * the contents means a new flower basket gets the note without anyone having
 * to remember a checkbox.
 *
 * The words matter: "Covered in Roses" perfume, rose tea, sunflower oil and a
 * floral print on a baby blanket are not flowers. An item counts only when it
 * is described as fresh or decorative blooms, a bouquet, or a floral
 * arrangement, accent or styling.
 */

const BLOOMS =
  "(?:flowers?|roses|lil(?:y|ies)|carnations?|gerberas?|chrysanthemums?|daisies|tulips?|peonies|hydrangeas?|orchids?|baby's breath|stems)";

const FLOWER_ITEM = new RegExp(
  [
    `\\b(?:fresh|decorative)\\b[^,;()]*\\b${BLOOMS}\\b`,
    `\\bbouquets?\\b`,
    `\\bfloral (?:arrangements?|accents?|styling)\\b`,
  ].join("|"),
  "i"
);

export function containsFlowers(contentsEn: string[], inFlowersCollection = false): boolean {
  return inFlowersCollection || contentsEn.some((item) => FLOWER_ITEM.test(item));
}
