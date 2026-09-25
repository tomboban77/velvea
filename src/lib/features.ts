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

/**
 * Build-your-own basket (/custom). Paused: every container and add-on in the
 * database is still seeded demo data — placeholder names like "Belgian
 * truffles", no images on any of the 3 containers or 15 items, and French
 * names identical to the English. Selling from it would be selling inventory
 * that does not exist.
 *
 * Turning this back on is a content job, not a code one: add real containers
 * and add-ons with photography, real prices and real French names in
 * /admin/builder, then flip this to true. The builder itself works — checkout
 * re-prices every custom basket from the database and enforces capacity,
 * availability and shippability server-side.
 */
export const CUSTOM_BUILDER_ENABLED = false;

/**
 * First-load welcome (src/components/brand/Splash.tsx). Off switch for the
 * owner: a full-screen overlay is the one thing on the storefront that can
 * hold up the largest paint, so if Core Web Vitals in Search Console turn, set
 * this to false and the pre-paint script stops arming it.
 */
export const SPLASH_ENABLED = true;
