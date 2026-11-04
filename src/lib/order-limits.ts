/**
 * Order size rules (owner decision, 4 Nov 2026).
 *
 * Client-safe on purpose: the bag and the product page enforce the same
 * numbers the checkout re-checks on the server.
 */

/** The most baskets one online order can hold. Bigger orders come to us directly. */
export const MAX_ORDER_ITEMS = 10;

/** From this many baskets, an order needs the longer preparation below. */
export const LARGE_ORDER_ITEMS = 3;

/** Calendar days, like product lead times: the studio works seven days a week. */
export const LARGE_ORDER_LEAD_DAYS = 2;

/** Preparation the order size alone calls for (0 when it adds nothing). */
export function sizeLeadDays(itemCount: number): number {
  return itemCount >= LARGE_ORDER_ITEMS ? LARGE_ORDER_LEAD_DAYS : 0;
}
