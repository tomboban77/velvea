/**
 * Feature switches for things that are built but deliberately not live.
 *
 * Gift cards are paused: the storefront sells them but nothing issues, emails
 * or redeems a code, so every surface that would let a customer buy one stays
 * hidden until redemption ships. Flipping GIFT_CARDS_ENABLED back to true is
 * not enough on its own — issuance and redemption must be implemented first.
 */
export const GIFT_CARDS_ENABLED = false;

/** Slug of the purchasable gift-card product, excluded from the catalogue while paused. */
export const GIFT_CARD_SLUG = "velvea-gift-card";

/** Product slugs hidden from listings, search, sitemap and checkout. */
export const HIDDEN_PRODUCT_SLUGS: string[] = GIFT_CARDS_ENABLED ? [] : [GIFT_CARD_SLUG];
