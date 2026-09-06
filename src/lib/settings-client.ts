// Client-safe delivery/tax constants (mirror DEFAULT_SETTINGS).
// Used only for UI previews; authoritative totals are computed server-side.

export const CLIENT_SETTINGS = {
  freeShippingThresholdCents: 15000,
  standardShippingCents: 1495,
  localSameDayFeeCents: 1500,
  localStandardFeeCents: 900,
  sameDayCutoff: "16:00",
  taxRates: {
    ON: 13, QC: 14.975, BC: 12, AB: 5, SK: 11, MB: 12,
    NB: 15, NS: 14, PE: 15, NL: 15, YT: 5, NT: 5, NU: 5,
  } as Record<string, number>,
  defaultTaxRate: 13,
};

export function getSettingsClient() {
  return CLIENT_SETTINGS;
}

export function previewTaxRate(province?: string): number {
  if (!province) return CLIENT_SETTINGS.defaultTaxRate;
  return CLIENT_SETTINGS.taxRates[province.toUpperCase()] ?? CLIENT_SETTINGS.defaultTaxRate;
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
