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
    sameDayCutoff: string; // "16:00"
    localSameDayFeeCents: number;
    localStandardFeeCents: number;
    standardShippingCents: number;
    expressShippingCents: number;
    freeShippingThresholdCents: number;
  };
  tax: {
    // Combined sales-tax rate (%) applied by destination province.
    rates: Record<string, number>;
    default: number;
  };
};

// Canada combined sales-tax by province (approx., 2026). Used for estimates.
export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    email: "hello@velvea.ca",
    phone: "+1 (905) 555-0142",
    addressLine: "1 Mississauga Valley Blvd",
    city: "Mississauga",
    province: "ON",
    postalCode: "L5A 3S1",
    hours: "Mon–Fri, 9am–6pm ET",
  },
  social: {
    instagram: "https://instagram.com/velvea",
    facebook: "https://facebook.com/velvea",
    pinterest: "https://pinterest.com/velvea",
    tiktok: "https://tiktok.com/@velvea",
  },
  delivery: {
    sameDayCutoff: "16:00",
    localSameDayFeeCents: 1500,
    localStandardFeeCents: 900,
    standardShippingCents: 1495,
    expressShippingCents: 2495,
    freeShippingThresholdCents: 15000,
  },
  tax: {
    rates: {
      ON: 13,
      QC: 14.975,
      BC: 12,
      AB: 5,
      SK: 11,
      MB: 12,
      NB: 15,
      NS: 14,
      PE: 15,
      NL: 15,
      YT: 5,
      NT: 5,
      NU: 5,
    },
    default: 13,
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
