"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { computeTotals, computeDiscount } from "@/lib/pricing";
import { resolveZone, getZones, pickupZone, methodAllowedInZone, provinceForFsa, toFsa } from "@/lib/zones";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderAwaitingPayment, sendAdminOrderNotice, type OrderEmailItem } from "@/lib/email";
import { generateOrderNumber, formatMoney } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { offlineOrdersAllowed, siteUrl } from "@/lib/env";
import { rateLimitBoth, rateLimitByIp, rateLimitMessage } from "@/lib/rate-limit";
import { HIDDEN_PRODUCT_SLUGS } from "@/lib/features";
import { reserveDiscount, releaseDiscount, customerRedemptions } from "@/lib/discounts";
import { signOrderToken } from "@/lib/tokens";
import { parseStoreDate, storeYmd, storeMinutesOfDay, cutoffMinutes, addStoreDays } from "@/lib/dates";
import type { DeliveryMethod, DiscountCode, DeliveryZone } from "@prisma/client";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().min(1).max(120),
  line1: z.string().min(1).max(160),
  line2: z.string().max(160).optional().default(""),
  city: z.string().min(1).max(80),
  province: z.string().min(2).max(2),
  postalCode: z.string().min(3).max(12),
  country: z.string().max(2).default("CA"),
  phone: z.string().max(40).optional().default(""),
});

/**
 * The custom-basket payload used to be `z.any()`, which meant the shape the
 * pricing code assumed was never actually checked.
 */
const customConfigSchema = z.object({
  containerId: z.string().min(1),
  // One entry per unit — the builder pushes the same id once per quantity.
  itemIds: z.array(z.string().min(1)).max(60).default([]),
  note: z.string().max(300).optional().default(""),
});

const itemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().max(200),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  isCustom: z.boolean().optional(),
  customConfig: z.unknown().optional(),
  image: z.string().max(500).optional(),
  /** Per-basket message card. Falls back to the order-level message. */
  giftMessage: z.string().max(300).optional(),
  /** Upgrade to a full-size store greeting card; the fee is re-read from settings. */
  premiumCard: z.boolean().optional(),
  /** The fee the cart showed, so a change is surfaced rather than silently charged. */
  cardFeeCents: z.number().int().nonnegative().optional(),
});

const checkoutSchema = z.object({
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().default(""),
  deliveryMethod: z.enum(["SHIPPING", "LOCAL_SAMEDAY", "LOCAL_STANDARD", "PICKUP"]),
  shipping: addressSchema,
  giftMessage: z.string().max(500).optional().default(""),
  deliveryDate: z.string().max(10).optional().default(""),
  deliveryNotes: z.string().max(500).optional().default(""),
  discountCode: z.string().max(40).optional().default(""),
  locale: z.enum(["en", "fr"]).optional().default("en"),
  items: z.array(itemSchema).min(1).max(40),
  /** Honeypot — a real browser leaves it empty; bots fill every field. */
  company: z.string().max(200).optional().default(""),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

/**
 * Something the customer saw that no longer holds. These are surfaced
 * individually rather than silently corrected, so the total on screen is never
 * quietly different from the total charged.
 */
export type CartChange = {
  kind:
    | "unavailable"
    | "variant-gone"
    | "price-changed"
    | "out-of-stock"
    | "delivery-area"
    | "not-shippable"
    | "delivery-date"
    | "builder-unavailable"
    | "builder-capacity"
    | "discount";
  /** What it concerns — a product name, or the delivery method. */
  subject: string;
  message: string;
};

type LineItem = {
  productId: string | null;
  variantId: string | null;
  slug: string | null;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  isCustom: boolean;
  customConfig: unknown;
  /** Localized add-on names, for emails and the admin order view. */
  customItems: string[];
  giftMessage: string | null;
  /** Per-unit fee for the store greeting card upgrade; 0 for the free card. */
  cardFeeCents: number;
  leadTimeDays: number;
  /** False for baskets that cannot be handed to a carrier. */
  shippable: boolean;
};

type ResolveOutcome =
  | { ok: true; lines: LineItem[] }
  | { ok: false; changes: CartChange[] };

const fr = (locale: string) => locale === "fr";
const say = (locale: string, en: string, frText: string) => (fr(locale) ? frText : en);

// ---------------------------------------------------------------------------
// Line resolution
// ---------------------------------------------------------------------------

async function resolveCustomLine(
  item: z.infer<typeof itemSchema>,
  locale: string,
  changes: CartChange[]
): Promise<LineItem | null> {
  const parsed = customConfigSchema.safeParse(item.customConfig);
  if (!parsed.success) {
    changes.push({
      kind: "builder-unavailable",
      subject: say(locale, "Custom Basket", "Panier personnalisé"),
      message: say(
        locale,
        "Your custom basket could not be read. Please build it again.",
        "Votre panier personnalisé n'a pas pu être lu. Veuillez le reconstruire."
      ),
    });
    return null;
  }
  const cfg = parsed.data;

  // Count occurrences: `findMany({ id: { in } })` de-duplicates, so picking the
  // same add-on three times used to be charged once.
  const counts = new Map<string, number>();
  for (const id of cfg.itemIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const uniqueIds = [...counts.keys()];

  const [container, addons] = await Promise.all([
    prisma.builderContainer.findUnique({ where: { id: cfg.containerId } }),
    uniqueIds.length
      ? prisma.builderItem.findMany({ where: { id: { in: uniqueIds } } })
      : Promise.resolve([]),
  ]);

  const label = say(locale, "Custom Basket", "Panier personnalisé");

  if (!container || !container.active) {
    changes.push({
      kind: "builder-unavailable",
      subject: label,
      message: say(
        locale,
        "The basket style you chose is no longer available.",
        "Le contenant choisi n'est plus disponible."
      ),
    });
    return null;
  }

  const missing = uniqueIds.filter((id) => !addons.some((a) => a.id === id && a.active));
  if (missing.length) {
    changes.push({
      kind: "builder-unavailable",
      subject: label,
      message: say(
        locale,
        `${missing.length} add-on${missing.length > 1 ? "s are" : " is"} no longer available. Please review your basket.`,
        `${missing.length} article${missing.length > 1 ? "s ne sont" : " n'est"} plus disponible. Veuillez revoir votre panier.`
      ),
    });
    return null;
  }

  const totalAddons = [...counts.values()].reduce((s, n) => s + n, 0);
  if (totalAddons > container.capacity) {
    changes.push({
      kind: "builder-capacity",
      subject: label,
      message: say(
        locale,
        `That basket holds ${container.capacity} items; yours has ${totalAddons}.`,
        `Ce panier contient ${container.capacity} articles; le vôtre en a ${totalAddons}.`
      ),
    });
    return null;
  }

  const snapshotItems = addons.map((a) => ({
    itemId: a.id,
    name: t(a.name, locale),
    qty: counts.get(a.id) ?? 0,
    unitPriceCents: a.priceCents,
  }));

  const unitPriceCents =
    container.priceCents +
    snapshotItems.reduce((s, i) => s + i.unitPriceCents * i.qty, 0);

  if (unitPriceCents <= 0) {
    changes.push({
      kind: "builder-unavailable",
      subject: label,
      message: say(locale, "Your custom basket is empty.", "Votre panier personnalisé est vide."),
    });
    return null;
  }

  const customItems = snapshotItems.map((i) => (i.qty > 1 ? `${i.name} × ${i.qty}` : i.name));

  return {
    productId: null,
    variantId: null,
    slug: null,
    name: label,
    variantLabel: t(container.name, locale),
    imageUrl: item.image ?? null,
    unitPriceCents,
    quantity: item.quantity,
    isCustom: true,
    customConfig: {
      containerId: container.id,
      containerName: t(container.name, locale),
      containerPriceCents: container.priceCents,
      items: snapshotItems,
      note: cfg.note,
    },
    customItems,
    giftMessage: item.giftMessage?.trim() || null,
    // The builder has no card upgrade yet; its own note is written on the free card.
    cardFeeCents: 0,
    leadTimeDays: 2,
    // A basket travels only as well as its least robust contents. This used to
    // be hardcoded true, so a custom basket of fresh flowers and cheese would
    // have been handed to a courier.
    shippable: addons.every((a) => a.shippable),
  };
}

async function resolveLineItems(
  items: z.infer<typeof itemSchema>[],
  locale: string,
  premiumCardFeeCents: number
): Promise<ResolveOutcome> {
  const lines: LineItem[] = [];
  const changes: CartChange[] = [];

  for (const item of items) {
    if (item.isCustom) {
      const line = await resolveCustomLine(item, locale, changes);
      if (line) lines.push(line);
      continue;
    }

    if (!item.productId) {
      changes.push({
        kind: "unavailable",
        subject: item.name,
        message: say(locale, "This item is no longer available.", "Cet article n'est plus disponible."),
      });
      continue;
    }

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
    });

    if (!product || product.status !== "ACTIVE" || HIDDEN_PRODUCT_SLUGS.includes(product.slug)) {
      changes.push({
        kind: "unavailable",
        subject: item.name,
        message: say(locale, "This item is no longer available.", "Cet article n'est plus disponible."),
      });
      continue;
    }

    const name = t(product.name, locale);

    let unitPriceCents = product.priceCents;
    let variantLabel: string | null = null;
    let variantId: string | null = null;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        // Saving a product used to delete and recreate every variant, so a cart
        // holding the old id silently fell back to the base price.
        changes.push({
          kind: "variant-gone",
          subject: name,
          message: say(
            locale,
            "The option you chose has changed. Please pick it again.",
            "L'option choisie a changé. Veuillez la sélectionner à nouveau."
          ),
        });
        continue;
      }
      if (!variant.inStock) {
        changes.push({
          kind: "out-of-stock",
          subject: `${name} — ${t(variant.label, locale)}`,
          message: say(locale, "This option is sold out.", "Cette option est épuisée."),
        });
        continue;
      }
      unitPriceCents = variant.priceCents;
      variantLabel = t(variant.label, locale);
      variantId = variant.id;
    }

    // The server price always wins, but a difference from what the cart showed
    // is surfaced rather than silently charged: the total on screen must never
    // quietly differ from the total on the card.
    if (!item.isCustom && item.unitPriceCents !== unitPriceCents) {
      changes.push({
        kind: "price-changed",
        subject: name,
        message: say(
          locale,
          `The price has changed to ${formatMoney(unitPriceCents)} since you added it. Please review your bag.`,
          `Le prix est passé à ${formatMoney(unitPriceCents, "fr-CA")} depuis l'ajout au sac. Veuillez vérifier votre sac.`
        ),
      });
      continue;
    }

    // The card fee follows the same rule as the price: settings win, but a
    // difference from what the cart showed is surfaced, never silently charged.
    const cardFeeCents = item.premiumCard ? premiumCardFeeCents : 0;
    if (item.premiumCard && (item.cardFeeCents ?? 0) !== cardFeeCents) {
      changes.push({
        kind: "price-changed",
        subject: name,
        message: say(
          locale,
          `The greeting card fee has changed to ${formatMoney(cardFeeCents)} since you added it. Please review your bag.`,
          `Les frais de carte de vœux sont passés à ${formatMoney(cardFeeCents, "fr-CA")} depuis l'ajout au sac. Veuillez vérifier votre sac.`
        ),
      });
      continue;
    }

    if (product.inventory !== null && product.inventory < item.quantity) {
      changes.push({
        kind: "out-of-stock",
        subject: name,
        message:
          product.inventory <= 0
            ? say(locale, "This basket is sold out.", "Ce panier est épuisé.")
            : say(
                locale,
                `Only ${product.inventory} left — please reduce the quantity.`,
                `Il n'en reste que ${product.inventory} — veuillez réduire la quantité.`
              ),
      });
      continue;
    }

    lines.push({
      productId: product.id,
      variantId,
      slug: product.slug,
      name,
      variantLabel,
      imageUrl: product.images[0]?.url ?? null,
      unitPriceCents,
      quantity: item.quantity,
      isCustom: false,
      customConfig: null,
      customItems: [],
      giftMessage: item.giftMessage?.trim() || null,
      cardFeeCents,
      leadTimeDays: product.leadTimeDays,
      shippable: product.shippable,
    });
  }

  if (changes.length) return { ok: false, changes };
  return { ok: true, lines };
}

// ---------------------------------------------------------------------------
// Delivery validation
// ---------------------------------------------------------------------------

/**
 * Delivery rules for a resolved zone.
 *
 * Eligibility is no longer a city-name lookup. The zone was already resolved
 * from the postal code, so this only has to police what that zone permits:
 * the method, the cutoff, and how soon we can realistically be there.
 */
function validateDelivery({
  zone,
  method,
  deliveryDate,
  leadTimeDays,
  handoffCutoff,
  locale,
}: {
  zone: DeliveryZone;
  method: DeliveryMethod;
  deliveryDate: string;
  leadTimeDays: number;
  handoffCutoff: string;
  locale: string;
}): CartChange[] {
  const changes: CartChange[] = [];

  if (!methodAllowedInZone(zone, method)) {
    changes.push({
      kind: "delivery-area",
      subject: say(locale, "Delivery method", "Mode de livraison"),
      message: say(
        locale,
        `${t(zone.name, "en")} isn't served by that delivery method. Please choose another option.`,
        `${t(zone.name, "fr")} n'est pas desservi par ce mode de livraison. Veuillez choisir une autre option.`
      ),
    });
    return changes;
  }

  const today = storeYmd();

  // Collection happens at the studio, so there is no travel to plan for.
  if (method === "PICKUP") {
    if (deliveryDate && deliveryDate < today) {
      changes.push({
        kind: "delivery-date",
        subject: say(locale, "Pickup date", "Date de ramassage"),
        message: say(locale, "That date has passed.", "Cette date est passée."),
      });
    }
    return changes;
  }

  if (method === "LOCAL_SAMEDAY") {
    // Same-day is a per-zone promise now: the far tiers carry no cutoff at
    // all, because we cannot drive an hour out and back the same afternoon.
    if (!zone.sameDayCutoff) {
      changes.push({
        kind: "delivery-area",
        subject: say(locale, "Same-day delivery", "Livraison le jour même"),
        message: say(
          locale,
          `Same-day delivery isn't available in ${t(zone.name, "en")}.`,
          `La livraison le jour même n'est pas offerte dans ${t(zone.name, "fr")}.`
        ),
      });
      return changes;
    }
    // The cutoff was previously only enforced in the browser.
    if (storeMinutesOfDay() >= cutoffMinutes(zone.sameDayCutoff)) {
      changes.push({
        kind: "delivery-date",
        subject: say(locale, "Same-day delivery", "Livraison le jour même"),
        message: say(
          locale,
          `Same-day orders for this area close at ${zone.sameDayCutoff} ET. Please choose another delivery method.`,
          `Les commandes du jour même pour ce secteur ferment à ${zone.sameDayCutoff} HE. Veuillez choisir un autre mode de livraison.`
        ),
      });
    }
    if (deliveryDate && deliveryDate !== today) {
      changes.push({
        kind: "delivery-date",
        subject: say(locale, "Delivery date", "Date de livraison"),
        message: say(
          locale,
          "Same-day delivery must be for today.",
          "La livraison le jour même doit être pour aujourd'hui."
        ),
      });
    }
    return changes;
  }

  if (!deliveryDate) return changes;

  const parsed = parseStoreDate(deliveryDate);
  if (!parsed) {
    changes.push({
      kind: "delivery-date",
      subject: say(locale, "Delivery date", "Date de livraison"),
      message: say(locale, "That date isn't valid.", "Cette date n'est pas valide."),
    });
    return changes;
  }

  // Two things have to happen before it arrives: we assemble it (the product
  // lead time) and it travels (the zone's minimum). Anything ordered after the
  // daily handoff starts that clock tomorrow.
  const pastCutoff = storeMinutesOfDay() >= cutoffMinutes(handoffCutoff);
  const totalDays = Math.max(leadTimeDays, zone.minLeadDays) + (pastCutoff ? 1 : 0);
  const earliest = addStoreDays(today, totalDays);
  if (deliveryDate < earliest) {
    changes.push({
      kind: "delivery-date",
      subject: say(locale, "Delivery date", "Date de livraison"),
      message: say(
        locale,
        `The earliest we can deliver this basket to ${t(zone.name, "en")} is ${earliest}.`,
        `La date la plus proche pour ce panier vers ${t(zone.name, "fr")} est le ${earliest}.`
      ),
    });
  }

  // A year out is well beyond any real gifting window.
  if (deliveryDate > addStoreDays(today, 365)) {
    changes.push({
      kind: "delivery-date",
      subject: say(locale, "Delivery date", "Date de livraison"),
      message: say(locale, "That date is too far ahead.", "Cette date est trop éloignée."),
    });
  }

  return changes;
}


// ---------------------------------------------------------------------------
// createCheckout
// ---------------------------------------------------------------------------

export type CheckoutResult =
  | { ok: true; mode: "stripe"; url: string }
  /** `token` gates the confirmation page, which no longer trusts the order number. */
  | { ok: true; mode: "offline"; orderNumber: string; token: string }
  | { ok: false; error: string; changes?: CartChange[] };

export async function createCheckout(rawInput: CheckoutInput): Promise<CheckoutResult> {
  let input: z.infer<typeof checkoutSchema>;
  try {
    input = checkoutSchema.parse(rawInput);
  } catch {
    return { ok: false, error: "Please complete all required fields." };
  }

  const locale = input.locale;

  // Honeypot: quietly refuse rather than explaining what gave it away.
  if (input.company.trim()) {
    return {
      ok: false,
      error: say(locale, "We couldn't process that request.", "Nous n'avons pas pu traiter cette demande."),
    };
  }

  const limit = await rateLimitBoth("checkout", input.email);
  if (!limit.ok) return { ok: false, error: rateLimitMessage(limit, fr(locale)) };

  const settings = await getSettings();
  const session = await getSession();

  const resolved = await resolveLineItems(input.items, locale, settings.gifting.premiumCardFeeCents);
  if (!resolved.ok) {
    return {
      ok: false,
      error: say(
        locale,
        "Some items in your bag have changed. Please review your order.",
        "Certains articles de votre panier ont changé. Veuillez revoir votre commande."
      ),
      changes: resolved.changes,
    };
  }
  const lines = resolved.lines;
  if (lines.length === 0) {
    return { ok: false, error: say(locale, "Your cart is empty.", "Votre panier est vide.") };
  }

  const method: DeliveryMethod = input.deliveryMethod;

  // --- Zone ---
  // The postal code decides where this is going. The province dropdown is only
  // a cross-check: it is a guess the customer can get wrong, and trusting it is
  // how an order to Toronto could previously be taxed at the Alberta rate.
  const zones = await getZones();
  const pickup = pickupZone(zones);
  let zone;

  if (method === "PICKUP") {
    if (!pickup) {
      return {
        ok: false,
        error: say(locale, "Pickup isn't available.", "Le ramassage n'est pas disponible."),
      };
    }
    zone = pickup;
  } else {
    const match = await resolveZone(input.shipping.postalCode);
    if (!match.ok) {
      const message =
        match.reason === "invalid-postal"
          ? say(
              locale,
              "That doesn't look like a Canadian postal code. Please check it.",
              "Ce code postal canadien semble incorrect. Veuillez le vérifier."
            )
          : match.reason === "quote"
          ? say(
              locale,
              "We can reach this address, but it has to be quoted by hand. Please contact us and we'll arrange it.",
              "Nous pouvons livrer à cette adresse, mais le tarif doit être établi manuellement. Veuillez nous contacter."
            )
          : say(
              locale,
              "We currently deliver within Ontario only. Pickup from our Mississauga studio is available for any address.",
              "Nous livrons actuellement en Ontario seulement. Le ramassage à notre atelier de Mississauga demeure possible."
            );
      return {
        ok: false,
        error: message,
        changes: [
          {
            kind: "delivery-area",
            subject: say(locale, "Delivery address", "Adresse de livraison"),
            message,
          },
        ],
      };
    }
    zone = match.zone;
  }

  // Anything that cannot survive a carrier is local and pickup only. This used
  // to be discovered at packing time, after the customer had paid.
  if (zone.kind === "SHIPPING") {
    const blocked = lines.filter((l) => !l.shippable);
    if (blocked.length) {
      return {
        ok: false,
        error: say(
          locale,
          "Some items in your bag can't be shipped. They're available for local delivery or pickup.",
          "Certains articles de votre panier ne peuvent pas être expédiés. Ils sont offerts en livraison locale ou en ramassage."
        ),
        changes: blocked.map((l) => ({
          kind: "not-shippable" as const,
          subject: l.name,
          message: say(
            locale,
            "Too perishable to ship — choose local delivery or pickup.",
            "Trop périssable pour l'expédition — choisissez la livraison locale ou le ramassage."
          ),
        })),
      };
    }
  }

  const leadTimeDays = lines.reduce((max, l) => Math.max(max, l.leadTimeDays), 0);
  const deliveryChanges = validateDelivery({
    zone,
    method,
    deliveryDate: input.deliveryDate,
    leadTimeDays,
    handoffCutoff: settings.delivery.orderCutoff,
    locale,
  });
  if (deliveryChanges.length) {
    return {
      ok: false,
      error: say(
        locale,
        "We can't deliver this order as entered. Please review the delivery details.",
        "Nous ne pouvons pas livrer cette commande telle quelle. Veuillez revoir les détails de livraison."
      ),
      changes: deliveryChanges,
    };
  }

  // Tax follows the postal code, not the dropdown. Pickup is always collected
  // here, so it is taxed at our own rate.
  const taxProvince =
    method === "PICKUP"
      ? settings.contact.province
      : provinceForFsa(toFsa(input.shipping.postalCode) ?? "") ?? input.shipping.province;

  // --- Discount ---
  // The card upgrade is part of the line, so it counts toward the subtotal,
  // discounts and the free-delivery threshold like any other add-on.
  const subtotalCents = lines.reduce((s, l) => s + (l.unitPriceCents + l.cardFeeCents) * l.quantity, 0);
  let discount: DiscountCode | null = null;
  let discountReserved = false;

  if (input.discountCode) {
    const code = input.discountCode.toUpperCase().trim();
    const found = await prisma.discountCode.findUnique({ where: { code } });
    const check = computeDiscount(found, subtotalCents);
    if (!check.valid) {
      return {
        ok: false,
        error: say(locale, "That discount code isn't valid.", "Ce code de rabais n'est pas valide."),
        changes: [
          {
            kind: "discount",
            subject: code,
            message: check.reason ?? say(locale, "Not applicable.", "Non applicable."),
          },
        ],
      };
    }
    if (found!.perCustomerLimit !== null) {
      const used = await customerRedemptions(code, input.email, session?.sub);
      if (used >= found!.perCustomerLimit) {
        return {
          ok: false,
          error: say(
            locale,
            "You've already used this discount code.",
            "Vous avez déjà utilisé ce code de rabais."
          ),
          changes: [
            {
              kind: "discount",
              subject: code,
              message: say(locale, "Limit reached for this customer.", "Limite atteinte pour ce client."),
            },
          ],
        };
      }
    }
    discountReserved = await reserveDiscount(code);
    if (!discountReserved) {
      return {
        ok: false,
        error: say(
          locale,
          "That discount code has just been fully redeemed.",
          "Ce code de rabais vient d'être entièrement utilisé."
        ),
        changes: [
          {
            kind: "discount",
            subject: code,
            message: say(locale, "No redemptions left.", "Plus aucune utilisation disponible."),
          },
        ],
      };
    }
    discount = found;
  }

  /** Undo the reservation on any path that doesn't end in a live checkout. */
  const releaseIfReserved = async () => {
    if (discountReserved && discount) await releaseDiscount(discount.code);
  };

  const totals = computeTotals({
    settings,
    zone,
    lines: lines.map((l) => ({ unitPriceCents: l.unitPriceCents + l.cardFeeCents, quantity: l.quantity })),
    province: taxProvince,
    method,
    discount,
  });

  const orderNumber = generateOrderNumber();
  const stripeReady = isStripeConfigured();

  if (!stripeReady && !offlineOrdersAllowed()) {
    await releaseIfReserved();
    console.error("[checkout] Stripe is not configured and ALLOW_OFFLINE_ORDERS is not set.");
    return {
      ok: false,
      error: say(
        locale,
        "Payments are temporarily unavailable. Please try again shortly.",
        "Les paiements sont temporairement indisponibles. Veuillez réessayer sous peu."
      ),
    };
  }

  let order;
  try {
    order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.sub ?? null,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        status: "PENDING",
        deliveryMethod: method,
        deliveryZoneKey: zone.key,
        locale,
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        taxCents: totals.taxCents,
        discountCents: totals.discountCents,
        totalCents: totals.totalCents,
        discountCode: discount?.code ?? null,
        giftMessage: input.giftMessage || null,
        deliveryDate: input.deliveryDate ? parseStoreDate(input.deliveryDate) : null,
        deliveryNotes: input.deliveryNotes || null,
        shipping: input.shipping,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            slug: l.slug,
            name: l.name,
            variantLabel: l.variantLabel,
            imageUrl: l.imageUrl,
            unitPriceCents: l.unitPriceCents,
            quantity: l.quantity,
            isCustom: l.isCustom,
            customConfig: l.customConfig as object | undefined,
            giftMessage: l.giftMessage,
            cardFeeCents: l.cardFeeCents,
          })),
        },
        timeline: { create: { label: "Order placed", note: "Awaiting payment" } },
      },
    });
  } catch (err) {
    await releaseIfReserved();
    console.error("[checkout] Could not record the order:", err);
    return {
      ok: false,
      error: say(
        locale,
        "We couldn't record your order. Please try again.",
        "Nous n'avons pas pu enregistrer votre commande. Veuillez réessayer."
      ),
    };
  }

  const emailItems: OrderEmailItem[] = lines.map((l) => ({
    name: l.name,
    variantLabel: l.variantLabel,
    quantity: l.quantity,
    unitPriceCents: l.unitPriceCents,
    isCustom: l.isCustom,
    customItems: l.customItems,
    giftMessage: l.giftMessage,
    cardFeeCents: l.cardFeeCents,
  }));
  const emailData = {
    orderNumber,
    email: order.email,
    locale,
    phone: order.phone,
    items: emailItems,
    subtotalCents: totals.subtotalCents,
    shippingCents: totals.shippingCents,
    taxCents: totals.taxCents,
    discountCents: totals.discountCents,
    totalCents: totals.totalCents,
    discountCode: order.discountCode,
    deliveryMethod: method,
    deliveryDate: order.deliveryDate,
    deliveryNotes: order.deliveryNotes,
    shipping: input.shipping,
    giftMessage: input.giftMessage,
  };

  // --- Stripe ---
  if (stripeReady) {
    try {
      const stripe = getStripe();
      const site = siteUrl();

      const lineItems = lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "cad",
          unit_amount: l.unitPriceCents,
          product_data: {
            name: l.name + (l.variantLabel ? ` — ${l.variantLabel}` : ""),
          },
        },
      }));
      // The card upgrade is its own Stripe line so the receipt shows what was paid for.
      for (const l of lines) {
        if (l.cardFeeCents > 0) {
          lineItems.push({
            quantity: l.quantity,
            price_data: {
              currency: "cad",
              unit_amount: l.cardFeeCents,
              product_data: {
                name: say(locale, "Premium greeting card", "Carte de vœux premium") + ` — ${l.name}`,
              },
            },
          });
        }
      }
      if (totals.shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: totals.shippingCents,
            product_data: { name: "Shipping" },
          },
        });
      }
      if (totals.taxCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: totals.taxCents,
            product_data: { name: "Sales tax (HST/GST/PST)" },
          },
        });
      }

      // The coupon is single-use and short-lived, and its id rides along in the
      // session metadata so the webhook can delete it once the session settles.
      const discounts: { coupon: string }[] = [];
      let couponId: string | undefined;
      if (totals.discountCents > 0) {
        const coupon = await stripe.coupons.create(
          {
            amount_off: totals.discountCents,
            currency: "cad",
            duration: "once",
            max_redemptions: 1,
            redeem_by: Math.floor(Date.now() / 1000) + 60 * 60 * 25,
            name: discount?.code ?? "Discount",
            metadata: { orderId: order.id },
          },
          { idempotencyKey: `coupon_${order.id}` }
        );
        couponId = coupon.id;
        discounts.push({ coupon: coupon.id });
      }

      const checkout = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          line_items: lineItems,
          discounts,
          customer_email: order.email,
          locale: locale === "fr" ? "fr-CA" : "en",
          success_url: `${site}/order/${orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${site}/checkout?canceled=1`,
          metadata: {
            orderId: order.id,
            orderNumber,
            ...(couponId ? { couponId } : {}),
          },
          payment_intent_data: { metadata: { orderId: order.id, orderNumber } },
        },
        // Retrying the same order must never create a second charge.
        { idempotencyKey: `checkout_${order.id}` }
      );

      // Past this point the session is live and the customer is about to be sent
      // to it, so a failed write must never reach the catch below: that would
      // cancel the order and release the discount while a payable session still
      // exists. The webhook keys off metadata.orderId, not this column, which is
      // only used to expire an abandoned session (actions/orders.ts), so losing
      // it costs housekeeping and nothing else.
      await prisma.order
        .update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } })
        .catch((err) => console.error("[checkout] could not record stripeSessionId:", err));

      return { ok: true, mode: "stripe", url: checkout.url! };
    } catch (err) {
      // Previously this fell through to the offline path: the customer was
      // emailed "order confirmed" and the admin told to pack it, with nobody
      // having paid. Fail loudly instead.
      console.error("[checkout] Stripe session creation failed:", err);
      await releaseIfReserved();
      await prisma.order
        .update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            discountCode: null,
            timeline: { create: { label: "Cancelled", note: "Payment session could not be created" } },
          },
        })
        .catch(() => {});
      return {
        ok: false,
        error: say(
          locale,
          "We couldn't reach our payment provider. Nothing has been charged — please try again in a moment.",
          "Nous n'avons pas pu joindre notre fournisseur de paiement. Rien n'a été facturé — veuillez réessayer dans un instant."
        ),
      };
    }
  }

  // --- Offline path (explicitly enabled, no Stripe) ---
  // The order exists but is unpaid, and both emails say so.
  await sendOrderAwaitingPayment(emailData);
  await sendAdminOrderNotice(emailData, { paid: false });
  return {
    ok: true,
    mode: "offline",
    orderNumber,
    token: await signOrderToken(orderNumber),
  };
}

// ---------------------------------------------------------------------------
// Discount preview
// ---------------------------------------------------------------------------

export async function validateDiscountCode(
  code: string,
  subtotalCents: number,
  locale: "en" | "fr" = "en"
): Promise<{ valid: boolean; label?: string; discountCents?: number; freeShipping?: boolean; reason?: string }> {
  if (!code) return { valid: false };

  const limit = await rateLimitByIp("discountCheck");
  if (!limit.ok) return { valid: false, reason: rateLimitMessage(limit, fr(locale)) };

  const safeSubtotal = Number.isFinite(subtotalCents)
    ? Math.max(0, Math.min(Math.trunc(subtotalCents), 100_000_00))
    : 0;

  const discount = await prisma.discountCode
    .findUnique({ where: { code: code.toUpperCase().trim() } })
    .catch(() => null);

  const res = computeDiscount(discount, safeSubtotal);
  if (!res.valid) return { valid: false, reason: res.reason };

  const label =
    discount!.type === "PERCENT"
      ? say(locale, `${discount!.value}% off`, `${discount!.value} % de rabais`)
      : discount!.type === "FREE_SHIPPING"
      ? say(locale, "Free shipping", "Livraison gratuite")
      : say(locale, "Discount applied", "Rabais appliqué");

  return {
    valid: true,
    label,
    discountCents: res.discountCents,
    freeShipping: res.freeShipping,
  };
}
