import { prisma } from "./prisma";
import type { DeliveryZone, DeliveryMethod } from "@prisma/client";

/**
 * Delivery zone resolution.
 *
 * A destination is routed by its FSA — the first three characters of the
 * postal code — never by the city field. A customer typing "Woodbridge",
 * "Toronto, ON" or a misspelling used to fall straight through the old
 * `GTA_CITIES` list into national shipping; "L4L" cannot be typed wrong in a
 * way that silently resolves somewhere else.
 */

/**
 * First letter of a Canadian FSA to the province it belongs to. This is fixed
 * by Canada Post, not guessed: Ontario owns K, L, M, N and P outright, which
 * is why letter rules alone cover the whole province with no city list.
 *
 * X spans NT and NU, so it is deliberately absent — it can't be resolved to a
 * single province and we don't serve either.
 */
const PROVINCE_BY_FSA_LETTER: Record<string, string> = {
  A: "NL",
  B: "NS",
  C: "PE",
  E: "NB",
  G: "QC",
  H: "QC",
  J: "QC",
  K: "ON",
  L: "ON",
  M: "ON",
  N: "ON",
  P: "ON",
  R: "MB",
  S: "SK",
  T: "AB",
  V: "BC",
  Y: "YT",
};

/** Normalize anything the customer typed into a bare FSA, or null if it isn't one. */
export function toFsa(postalCode: string | undefined | null): string | null {
  if (!postalCode) return null;
  const cleaned = postalCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length < 3) return null;
  const fsa = cleaned.slice(0, 3);
  // Every Canadian FSA is letter-digit-letter. Anything else is a typo or a
  // US ZIP, and must not be routed as though it were an address we serve.
  return /^[A-Z]\d[A-Z]$/.test(fsa) ? fsa : null;
}

/** The province a postal code actually belongs to, regardless of what was selected. */
export function provinceForFsa(fsa: string): string | null {
  return PROVINCE_BY_FSA_LETTER[fsa[0]] ?? null;
}

export type ZoneMatch =
  | { ok: true; zone: DeliveryZone; fsa: string; province: string }
  | {
      ok: false;
      /**
       * `invalid-postal` — not a Canadian postal code at all.
       * `unserved`       — a real address in an area with no active zone.
       * `quote`          — reachable, but priced by hand rather than at checkout.
       */
      reason: "invalid-postal" | "unserved" | "quote";
      fsa: string | null;
      province: string | null;
      zone?: DeliveryZone;
    };

let cache: { zones: DeliveryZone[]; at: number } | null = null;
const TTL = 30_000;

/** Active zones, narrowest first. Cached briefly like site settings. */
export async function getZones(): Promise<DeliveryZone[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.zones;
  const zones = await prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { key: "asc" }],
  });
  cache = { zones, at: Date.now() };
  return zones;
}

/**
 * Zones for pages that only *describe* delivery rather than price it.
 *
 * `getZones` deliberately throws: if we cannot read the zones we must not
 * quote a price, and refusing beats guessing. But a marketing banner is not
 * worth a 500 — an unreachable database should cost the homepage its same-day
 * countdown, not the whole page, which is how the rest of this codebase reads
 * settings too.
 */
export async function getZonesForDisplay(): Promise<DeliveryZone[]> {
  try {
    return await getZones();
  } catch (err) {
    console.error("[zones] could not read delivery zones for display:", err);
    return [];
  }
}

/** Drop the cache after an admin edit so a rate change takes effect at once. */
export function clearZoneCache() {
  cache = null;
}

/** The studio-pickup zone, if one is configured. Offered to everyone. */
export function pickupZone(zones: DeliveryZone[]): DeliveryZone | null {
  return zones.find((z) => z.kind === "PICKUP") ?? null;
}

/**
 * Route a destination to exactly one zone.
 *
 * The postal code is authoritative and the selected province is only a
 * cross-check: the province dropdown is a guess the customer can get wrong,
 * and trusting it is how an order to Toronto could previously be taxed at the
 * BC rate. Exact FSA rules beat letter rules, so a remote community can be
 * carved out of the broad rule that would otherwise swallow it.
 */
export function resolveZoneFrom(
  zones: DeliveryZone[],
  postalCode: string | undefined | null
): ZoneMatch {
  const fsa = toFsa(postalCode);
  if (!fsa) return { ok: false, reason: "invalid-postal", fsa: null, province: null };

  const province = provinceForFsa(fsa);
  const routable = zones.filter((z) => z.kind !== "PICKUP");

  const byProvince = (z: DeliveryZone) =>
    z.provinces.length === 0 || (province !== null && z.provinces.includes(province));

  const zone =
    routable.find((z) => z.fsaPrefixes.includes(fsa) && byProvince(z)) ??
    routable.find((z) => z.fsaLetters.includes(fsa[0]) && byProvince(z)) ??
    null;

  if (!zone) return { ok: false, reason: "unserved", fsa, province };
  if (zone.kind === "BLOCKED") return { ok: false, reason: "unserved", fsa, province, zone };
  if (zone.kind === "QUOTE") return { ok: false, reason: "quote", fsa, province, zone };

  return { ok: true, zone, fsa, province: province ?? "" };
}

export async function resolveZone(postalCode: string | undefined | null): Promise<ZoneMatch> {
  return resolveZoneFrom(await getZones(), postalCode);
}

/**
 * The same-day cutoff to advertise in storefront copy.
 *
 * Cutoffs are per zone now, and a page rendered before we know the recipient's
 * postal code cannot know which one applies. The home local zone — the first
 * active one — is the honest thing to quote: it is the promise we can always
 * keep, and every other zone is stricter.
 */
export async function advertisedSameDayCutoff(): Promise<string | null> {
  const zones = await getZonesForDisplay();
  return zones.find((z) => z.kind === "LOCAL" && z.sameDayCutoff)?.sameDayCutoff ?? null;
}

/** Delivery methods a zone permits. `pastCutoff` suppresses same-day. */
export function methodsForZone(zone: DeliveryZone, pastCutoff: boolean): DeliveryMethod[] {
  if (zone.kind === "PICKUP") return ["PICKUP"];
  if (zone.kind === "LOCAL") {
    const methods: DeliveryMethod[] = [];
    if (zone.sameDayCutoff && !pastCutoff) methods.push("LOCAL_SAMEDAY");
    methods.push("LOCAL_STANDARD");
    return methods;
  }
  if (zone.kind === "SHIPPING") return ["SHIPPING"];
  return [];
}

/** Does this method belong to this zone? Guards a tampered checkout payload. */
export function methodAllowedInZone(zone: DeliveryZone, method: DeliveryMethod): boolean {
  if (method === "PICKUP") return zone.kind === "PICKUP";
  if (method === "SHIPPING") return zone.kind === "SHIPPING";
  return zone.kind === "LOCAL";
}
