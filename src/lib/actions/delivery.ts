"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { computeShipping } from "@/lib/pricing";
import { getZones, pickupZone, resolveZoneFrom, provinceForFsa, toFsa } from "@/lib/zones";
import { taxRateForProvince } from "@/lib/settings";
import { t } from "@/lib/i18n-content";
import { STORE_TIMEZONE, parseStoreDate, storeYmd } from "@/lib/dates";
import {
  bookedLocalDeliveries,
  bouquetProductIds,
  earliestScheduledDay,
  firstOpenDay,
  fullDays,
  sameDayBlocker,
  sameDayWindow,
} from "@/lib/delivery-schedule";
import { rateLimitByIp } from "@/lib/rate-limit";
import type { DeliveryMethod } from "@prisma/client";
import { z } from "zod";

/**
 * What the checkout may offer for a given destination.
 *
 * This exists so the browser never has to own a second copy of the rules. The
 * old checkout previewed totals from a hardcoded `CLIENT_SETTINGS` block, which
 * meant changing a fee in the admin left the storefront quoting the old number
 * until someone remembered to edit a TypeScript file. Everything below runs the
 * same `resolveZoneFrom` and `computeShipping` the charge itself runs.
 */
export type DeliveryOption = {
  method: DeliveryMethod;
  label: string;
  sub: string;
  feeCents: number;
  /** Local delivery only: the first day with room on the route, "YYYY-MM-DD". */
  earliestDate?: string;
  /** Local delivery only: days in the next month that are already full. */
  fullDates?: string[];
};

export type DeliveryQuote =
  | {
      ok: true;
      zoneKey: string;
      zoneName: string;
      province: string | null;
      taxRate: number;
      options: DeliveryOption[];
      /** Items in the bag that cannot be handed to a carrier. */
      unshippable: string[];
    }
  | {
      ok: false;
      reason: "invalid-postal" | "unserved" | "quote";
      message: string;
      /** Pickup stays on the table even when we cannot deliver there. */
      options: DeliveryOption[];
    };

const quoteSchema = z.object({
  postalCode: z.string().max(12),
  subtotalCents: z.number().int().nonnegative().max(100_000_00),
  itemCount: z.number().int().min(0).max(999),
  productIds: z.array(z.string().max(40)).max(40).default([]),
  /** Add-on ids from any custom baskets in the bag. */
  builderItemIds: z.array(z.string().max(40)).max(200).default([]),
  locale: z.enum(["en", "fr"]).default("en"),
});

export async function quoteDelivery(
  raw: z.input<typeof quoteSchema>
): Promise<DeliveryQuote> {
  const input = quoteSchema.parse(raw);
  const fr = input.locale === "fr";
  const say = (en: string, frText: string) => (fr ? frText : en);

  const limit = await rateLimitByIp("deliveryQuote");
  if (!limit.ok) {
    return {
      ok: false,
      reason: "invalid-postal",
      message: say("Please wait a moment and try again.", "Veuillez patienter un instant et réessayer."),
      options: [],
    };
  }

  const [settings, zones] = await Promise.all([getSettings(), getZones()]);

  // Pickup is a property of us, not of the customer's address, so it is
  // offered regardless of where the order is going — including to the people
  // we cannot deliver to at all.
  const pickup = pickupZone(zones);
  const pickupOptions: DeliveryOption[] = pickup
    ? [
        {
          method: "PICKUP",
          label: say("Pickup — our studio", "Ramassage — notre atelier"),
          sub: `${settings.contact.addressLine}, ${settings.contact.city}`,
          feeCents: 0,
        },
      ]
    : [];

  const match = resolveZoneFrom(zones, input.postalCode);
  if (!match.ok) {
    const message =
      match.reason === "invalid-postal"
        ? say("Enter a Canadian postal code.", "Entrez un code postal canadien.")
        : match.reason === "quote"
        ? say(
            "We can reach this address, but it has to be quoted by hand. Please contact us.",
            "Nous pouvons livrer à cette adresse, mais le tarif doit être établi manuellement. Veuillez nous contacter."
          )
        : match.province === "QC"
        ? say(
            "We don't ship to Quebec yet. Pickup is available for any address.",
            "Nous n'expédions pas encore au Québec. Le ramassage demeure possible."
          )
        : say(
            "We don't deliver to this area yet. Pickup is available for any address.",
            "Nous ne livrons pas encore dans cette région. Le ramassage demeure possible."
          );
    return { ok: false, reason: match.reason, message, options: pickupOptions };
  }

  const zone = match.zone;

  // A custom basket is only as shippable as its contents, so the add-ons are
  // checked alongside the catalogue products.
  const [blockedProducts, blockedAddons] = await Promise.all([
    input.productIds.length
      ? prisma.product.findMany({
          where: { id: { in: input.productIds }, shippable: false },
          select: { name: true },
        })
      : Promise.resolve([]),
    input.builderItemIds.length
      ? prisma.builderItem.findMany({
          where: { id: { in: input.builderItemIds }, shippable: false },
          select: { name: true },
        })
      : Promise.resolve([]),
  ]);
  const unshippable = [...blockedProducts, ...blockedAddons].map((r) =>
    t(r.name, input.locale)
  );

  const feeFor = (method: DeliveryMethod) =>
    computeShipping(zone, method, input.subtotalCents, input.itemCount).shippingCents;

  const options: DeliveryOption[] = [...pickupOptions];

  if (zone.kind === "LOCAL") {
    // Same rules the charge runs: bouquets never go same-day, and a day whose
    // route is full pushes the next order to the first day with room.
    const today = storeYmd();
    const [bouquets, booked, leadRows] = await Promise.all([
      bouquetProductIds(input.productIds),
      bookedLocalDeliveries(today),
      input.productIds.length
        ? prisma.product.findMany({
            where: { id: { in: input.productIds } },
            select: { leadTimeDays: true },
          })
        : Promise.resolve([]),
    ]);
    const hasBouquet = bouquets.size > 0;
    const leadTimeDays = Math.max(
      0,
      ...leadRows.map((r) => r.leadTimeDays),
      // A custom basket is assembled from scratch; see resolveCustomLine.
      input.builderItemIds.length ? 2 : 0
    );

    const cutoff = zone.sameDayCutoff;
    if (cutoff && !sameDayBlocker({ zone, hasBouquet, booked, cap: settings.delivery })) {
      options.push({
        method: "LOCAL_SAMEDAY",
        label: say("Same-day delivery", "Livraison le jour même"),
        sub: say(
          `Delivered today ${sameDayWindow(today, false)}. Order by ${cutoff} ET`,
          `Livré aujourd'hui ${sameDayWindow(today, true)}. Commandez avant ${cutoff} HE`
        ),
        feeCents: feeFor("LOCAL_SAMEDAY"),
      });
    }

    const earliest = firstOpenDay(
      earliestScheduledDay({
        zone,
        leadTimeDays,
        hasBouquet,
        handoffCutoff: settings.delivery.orderCutoff,
        local: true,
      }),
      booked,
      settings.delivery
    );
    options.push({
      method: "LOCAL_STANDARD",
      label: say("Local delivery", "Livraison locale"),
      sub: earliest
        ? say(`Earliest: ${dayLabel(earliest, "en-CA")}`, `Au plus tôt : ${dayLabel(earliest, "fr-CA")}`)
        : windowLabel(zone.minLeadDays, zone.maxLeadDays, fr),
      feeCents: feeFor("LOCAL_STANDARD"),
      earliestDate: earliest ?? undefined,
      fullDates: fullDays(today, booked, settings.delivery),
    });
  }

  if (zone.kind === "SHIPPING") {
    options.push({
      method: "SHIPPING",
      label: say("Shipping", "Expédition"),
      // Shipped orders are an estimate, never a promise — the carrier owns the
      // last leg and we should not guarantee a date we do not control.
      sub: windowLabel(zone.minLeadDays, zone.maxLeadDays, fr),
      feeCents: feeFor("SHIPPING"),
    });
  }

  const province = match.province || provinceForFsa(toFsa(input.postalCode) ?? "");

  return {
    ok: true,
    zoneKey: zone.key,
    zoneName: t(zone.name, input.locale),
    province,
    taxRate: taxRateForProvince(settings, province ?? undefined),
    options,
    unshippable,
  };
}

/** "Tuesday, October 27" in the store's time zone. */
function dayLabel(ymd: string, locale: string): string {
  const at = parseStoreDate(ymd);
  if (!at) return ymd;
  return new Intl.DateTimeFormat(locale, {
    timeZone: STORE_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(at);
}

function windowLabel(min: number, max: number, fr: boolean): string {
  if (min === 0 && max <= 1) return fr ? "Prochain jour disponible" : "Next available day";
  if (min === max) {
    return fr ? `Environ ${min} jour${min > 1 ? "s" : ""} ouvrable${min > 1 ? "s" : ""}` : `About ${min} business day${min > 1 ? "s" : ""}`;
  }
  return fr
    ? `Environ ${min} à ${max} jours ouvrables`
    : `About ${min}–${max} business days`;
}
