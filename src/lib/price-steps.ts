/**
 * Budget buckets shown as "Under $X" chips on listings, in the home gift
 * finder and as the home "Under" tab. One list so the three stay in sync and
 * a link from one always lights up the matching chip on the other
 * (`/baskets?max=9900` must equal a chip's value, or nothing looks selected).
 * Values are integer cents; the listing query uses `priceCents <= max`.
 */
export const PRICE_STEPS = [9900, 13500, 20000] as const;

/** Cap of the cheapest bucket: the home "Under $99" tab. */
export const UNDER_CENTS: number = PRICE_STEPS[0];

/** Floor of the open-ended "and up" bucket. */
export const OVER_CENTS: number = PRICE_STEPS[PRICE_STEPS.length - 1];
