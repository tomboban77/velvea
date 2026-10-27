import "server-only";

import { prisma } from "./prisma";
import { addStoreDays, cutoffMinutes, parseStoreDate, storeMinutesOfDay, storeYmd } from "./dates";
import type { DeliveryMethod, DeliveryZone, OrderStatus, Prisma } from "@prisma/client";

/**
 * When a GTA delivery can actually happen.
 *
 * We drive local orders ourselves, so the limit is how many stops one evening
 * (or one weekend day) can hold, not how fast a basket can be packed. Once a
 * day is full, the next order slides to the next day with room. Shipped
 * orders are not counted: the courier's capacity is not ours to manage.
 */

/**
 * Products in this collection are made to order and never go out same-day.
 * It is the storefront's Flowers category rather than a separate "bouquets"
 * collection, so anything filed under Flowers gets the next-day rule without
 * a second collection to keep in sync.
 */
export const BOUQUET_COLLECTION_SLUG = "flowers";

export const LOCAL_METHODS: DeliveryMethod[] = ["LOCAL_SAMEDAY", "LOCAL_STANDARD"];

/** Statuses that hold a delivery slot for good. */
const BOOKED: OrderStatus[] = ["PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED"];

/**
 * An unpaid order holds its slot only briefly. Stripe sessions live for a day,
 * and an abandoned checkout must not block one of four slots for that long;
 * almost everyone who pays does so within minutes.
 */
const PENDING_HOLD_MINUTES = 45;

/** How far ahead we search for an open day before giving up. */
const SEARCH_DAYS = 60;

export type DeliveryCapacity = { weekdayCapacity: number; weekendCapacity: number };

export function isWeekend(ymd: string): boolean {
  const [y, m, d] = ymd.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
}

export function capacityFor(ymd: string, cap: DeliveryCapacity): number {
  return isWeekend(ymd) ? cap.weekendCapacity : cap.weekdayCapacity;
}

/** Local deliveries already booked per Toronto day, from `fromYmd` for `days` days. */
export async function bookedLocalDeliveries(
  fromYmd: string,
  days = SEARCH_DAYS,
  now: Date = new Date()
): Promise<Map<string, number>> {
  const start = parseStoreDate(fromYmd);
  const end = parseStoreDate(addStoreDays(fromYmd, days));
  if (!start || !end) return new Map();
  const halfDay = 12 * 60 * 60 * 1000;

  const where: Prisma.OrderWhereInput = {
    deliveryMethod: { in: LOCAL_METHODS },
    // Dates are stored at Toronto noon; the half-day margin keeps a date an
    // admin typed at midnight inside the right bucket.
    deliveryDate: { gte: new Date(start.getTime() - halfDay), lt: new Date(end.getTime() + halfDay) },
    OR: [
      { status: { in: BOOKED } },
      { status: "PENDING", createdAt: { gte: new Date(now.getTime() - PENDING_HOLD_MINUTES * 60000) } },
    ],
  };
  const rows = await prisma.order.findMany({ where, select: { deliveryDate: true } });

  const booked = new Map<string, number>();
  for (const r of rows) {
    if (!r.deliveryDate) continue;
    const ymd = storeYmd(r.deliveryDate);
    booked.set(ymd, (booked.get(ymd) ?? 0) + 1);
  }
  return booked;
}

export function isFull(ymd: string, booked: Map<string, number>, cap: DeliveryCapacity): boolean {
  return (booked.get(ymd) ?? 0) >= capacityFor(ymd, cap);
}

/** The first day on or after `earliest` with room, or null if none within the search window. */
export function firstOpenDay(
  earliest: string,
  booked: Map<string, number>,
  cap: DeliveryCapacity
): string | null {
  for (let i = 0; i < SEARCH_DAYS; i++) {
    const day = addStoreDays(earliest, i);
    if (!isFull(day, booked, cap)) return day;
  }
  return null;
}

/** Full days in the window, so the checkout can warn before the customer submits. */
export function fullDays(
  from: string,
  booked: Map<string, number>,
  cap: DeliveryCapacity,
  days = 30
): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const day = addStoreDays(from, i);
    if (isFull(day, booked, cap)) out.push(day);
  }
  return out;
}

/**
 * The earliest day a scheduled local delivery could go out, before capacity.
 *
 * Assembly (the product lead time) and travel (the zone minimum) both have to
 * fit, and anything ordered after the daily handoff starts that clock
 * tomorrow. Bouquets are made to order, so they are never earlier than the
 * day after.
 *
 * Scheduled local delivery is never today either: today is the same-day
 * option, with its own cutoff, fee and window. Without this a basket with no
 * lead time could be booked for tonight at the cheaper standard rate.
 */
export function earliestScheduledDay({
  zone,
  leadTimeDays,
  hasBouquet,
  handoffCutoff,
  local = false,
  now = new Date(),
}: {
  zone: Pick<DeliveryZone, "minLeadDays">;
  leadTimeDays: number;
  hasBouquet: boolean;
  handoffCutoff: string;
  local?: boolean;
  now?: Date;
}): string {
  const pastCutoff = storeMinutesOfDay(now) >= cutoffMinutes(handoffCutoff);
  const lead = Math.max(leadTimeDays, zone.minLeadDays, hasBouquet || local ? 1 : 0);
  return addStoreDays(storeYmd(now), lead + (pastCutoff ? 1 : 0));
}

/**
 * Why same-day is off the table for this bag and zone, or null if it is offered.
 * Shared by the quote and the charge so they can never disagree.
 */
export function sameDayBlocker({
  zone,
  hasBouquet,
  booked,
  cap,
  now = new Date(),
}: {
  zone: Pick<DeliveryZone, "sameDayCutoff">;
  hasBouquet: boolean;
  booked: Map<string, number>;
  cap: DeliveryCapacity;
  now?: Date;
}): "no-same-day" | "past-cutoff" | "bouquet" | "full" | null {
  if (!zone.sameDayCutoff) return "no-same-day";
  if (storeMinutesOfDay(now) >= cutoffMinutes(zone.sameDayCutoff)) return "past-cutoff";
  if (hasBouquet) return "bouquet";
  if (isFull(storeYmd(now), booked, cap)) return "full";
  return null;
}

/**
 * When a same-day run arrives. Weekday runs go out after the working day;
 * weekends are spread through the day as the route allows.
 */
export function sameDayWindow(ymd: string, fr: boolean): string {
  if (isWeekend(ymd)) {
    return fr
      ? "en cours de journée, selon les commandes du jour"
      : "during the day, timing depends on that day's orders";
  }
  return fr ? "entre 19 h et 23 h" : "between 7 and 11 pm";
}

/** Which of these products are bouquets. */
export async function bouquetProductIds(productIds: string[]): Promise<Set<string>> {
  if (!productIds.length) return new Set();
  const rows = await prisma.productCollection.findMany({
    where: { productId: { in: productIds }, collection: { slug: BOUQUET_COLLECTION_SLUG } },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}
