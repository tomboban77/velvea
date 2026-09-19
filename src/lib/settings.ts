import { prisma } from "./prisma";

export type SiteSettings = {
  contact: {
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
    tiktok: string;
  };
  delivery: {
    /**
     * The daily production cutoff, "HH:MM" in store time. Orders placed after
     * it start their lead time tomorrow.
     *
     * Per-zone same-day cutoffs live on the zone itself, because how late we
     * can still reach somebody depends entirely on how far away they are.
     * Delivery fees are not here either — they belong to the zone that charges
     * them. See `prisma/zones.ts` and Admin -> Delivery zones.
     */
    orderCutoff: string;
  };
  tax: {
    // Combined sales-tax rate (%) applied by destination province.
    rates: Record<string, number>;
    default: number;
  };
};

// Combined sales tax by province. Only ON applies while we serve one province;
// the rest are kept so expanding is a zone change, not a code change.
export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    email: "giftsvelvea@gmail.com",
    phone: "+1 (905) 555-0142",
    addressLine: "5105 Hurontario Street",
    city: "Mississauga",
    province: "ON",
    postalCode: "L4Z 0C9",
    hours: "Mon–Fri, 9am–6pm ET",
  },
  social: {
    instagram: "https://instagram.com/velvea",
    facebook: "https://facebook.com/velvea",
    pinterest: "https://pinterest.com/velvea",
    tiktok: "https://tiktok.com/@velvea",
  },
  delivery: {
    orderCutoff: "16:00",
  },
  // Velvea is a small supplier: taxable revenue is under the $30,000 threshold
  // at which GST/HST registration becomes mandatory, so no tax is charged. It
  // is not that the rate is unknown — charging tax without a registration
  // number to remit it against is not permitted.
  //
  // When revenue passes $30,000 over four consecutive quarters, registration
  // is required and the rate goes back. The real combined rates, for when that
  // day comes: ON 13, QC 14.975, BC 12, AB 5, SK 11, MB 12, NB 15, NS 14,
  // PE 15, NL 15, YT 5, NT 5, NU 5.
  //
  // Note the threshold is crossed by a single sale, not at a quarter end: the
  // order that takes you past $30,000 is itself taxable.
  tax: {
    rates: {
      ON: 0,
    },
    default: 0,
  },
};

const SETTINGS_KEY = "site";

let cache: { value: SiteSettings; at: number } | null = null;
const TTL = 30_000;

/** Deep-merge stored overrides over defaults; resilient if the DB is offline. */
export async function getSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    const stored = (row?.value as Partial<SiteSettings>) ?? {};
    const merged: SiteSettings = {
      contact: { ...DEFAULT_SETTINGS.contact, ...stored.contact },
      social: { ...DEFAULT_SETTINGS.social, ...stored.social },
      delivery: { ...DEFAULT_SETTINGS.delivery, ...stored.delivery },
      tax: {
        rates: { ...DEFAULT_SETTINGS.tax.rates, ...stored.tax?.rates },
        default: stored.tax?.default ?? DEFAULT_SETTINGS.tax.default,
      },
    };
    cache = { value: merged, at: Date.now() };
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<SiteSettings>): Promise<void> {
  const current = await getSettings();
  const next: SiteSettings = {
    contact: { ...current.contact, ...patch.contact },
    social: { ...current.social, ...patch.social },
    delivery: { ...current.delivery, ...patch.delivery },
    tax: {
      rates: { ...current.tax.rates, ...patch.tax?.rates },
      default: patch.tax?.default ?? current.tax.default,
    },
  };
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: next as object },
    update: { value: next as object },
  });
  cache = { value: next, at: Date.now() };
}

export function taxRateForProvince(settings: SiteSettings, province?: string): number {
  if (!province) return settings.tax.default;
  return settings.tax.rates[province.toUpperCase()] ?? settings.tax.default;
}
