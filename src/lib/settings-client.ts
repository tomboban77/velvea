// Client-safe delivery/tax shape.
//
// These values are only a *fallback* for previews rendered before the server
// settings arrive. Authoritative totals — and the numbers shown at checkout —
// come from the database via the checkout page. Editing this file does not
// change what a customer is charged.

export type ClientSettings = {
  freeShippingThresholdCents: number;
  standardShippingCents: number;
  localSameDayFeeCents: number;
  localStandardFeeCents: number;
  sameDayCutoff: string;
  taxRates: Record<string, number>;
  defaultTaxRate: number;
};

export const CLIENT_SETTINGS: ClientSettings = {
  freeShippingThresholdCents: 15000,
  standardShippingCents: 1495,
  localSameDayFeeCents: 1500,
  localStandardFeeCents: 900,
  sameDayCutoff: "16:00",
  taxRates: {
    ON: 13, QC: 14.975, BC: 12, AB: 5, SK: 11, MB: 12,
    NB: 15, NS: 14, PE: 15, NL: 15, YT: 5, NT: 5, NU: 5,
  },
  defaultTaxRate: 13,
};

/** Kept for components that render before server settings are available. */
export function getSettingsClient(): ClientSettings {
  return CLIENT_SETTINGS;
}

export function previewTaxRate(province: string | undefined, settings: ClientSettings = CLIENT_SETTINGS): number {
  if (!province) return settings.defaultTaxRate;
  return settings.taxRates[province.toUpperCase()] ?? settings.defaultTaxRate;
}

export const GTA_CITIES_CLIENT = [
  "mississauga", "toronto", "brampton", "vaughan", "markham", "richmond hill",
  "oakville", "burlington", "milton", "whitby", "ajax", "pickering", "oshawa",
  "etobicoke", "scarborough", "north york", "thornhill",
];

export function isGtaClient(city?: string): boolean {
  if (!city) return false;
  return GTA_CITIES_CLIENT.includes(city.trim().toLowerCase());
}

export const PROVINCES = [
  { code: "ON", name: "Ontario" },
  { code: "QC", name: "Québec" },
  { code: "BC", name: "British Columbia" },
  { code: "AB", name: "Alberta" },
  { code: "MB", name: "Manitoba" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland & Labrador" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "YT", name: "Yukon" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
];
