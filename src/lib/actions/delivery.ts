"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { computeShipping } from "@/lib/pricing";
import { getZones, pickupZone, resolveZoneFrom, provinceForFsa, toFsa } from "@/lib/zones";
import { taxRateForProvince } from "@/lib/settings";
import { t } from "@/lib/i18n-content";
import { storeMinutesOfDay, cutoffMinutes } from "@/lib/dates";
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
        : say(
            "We deliver within Ontario only for now. Pickup is available for any address.",
            "Nous livrons en Ontario seulement pour l'instant. Le ramassage demeure possible."
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
    const cutoff = zone.sameDayCutoff;
    if (cutoff && storeMinutesOfDay() < cutoffMinutes(cutoff)) {
      options.push({
        method: "LOCAL_SAMEDAY",
        label: say("Same-day delivery", "Livraison le jour même"),
        sub: say(`Order within today's ${cutoff} ET cutoff`, `Avant ${cutoff} HE aujourd'hui`),
        feeCents: feeFor("LOCAL_SAMEDAY"),
      });
    }
    options.push({
      method: "LOCAL_STANDARD",
      label: say("Local delivery", "Livraison locale"),
      sub: windowLabel(zone.minLeadDays, zone.maxLeadDays, fr),
      feeCents: feeFor("LOCAL_STANDARD"),
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

function windowLabel(min: number, max: number, fr: boolean): string {
  if (min === 0 && max <= 1) return fr ? "Prochain jour disponible" : "Next available day";
  if (min === max) {
    return fr ? `Environ ${min} jour${min > 1 ? "s" : ""} ouvrable${min > 1 ? "s" : ""}` : `About ${min} business day${min > 1 ? "s" : ""}`;
  }
  return fr
    ? `Environ ${min} à ${max} jours ouvrables`
    : `About ${min}–${max} business days`;
}
