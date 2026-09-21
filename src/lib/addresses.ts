/**
 * Shared address vocabulary for the account area and checkout. Kept out of the
 * "use server" module so client components can import the province list and
 * the types without dragging server code into the bundle.
 */

export const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
] as const;

export type ProvinceCode = (typeof PROVINCES)[number];

export const PROVINCE_NAMES: Record<ProvinceCode, { en: string; fr: string }> = {
  AB: { en: "Alberta", fr: "Alberta" },
  BC: { en: "British Columbia", fr: "Colombie-Britannique" },
  MB: { en: "Manitoba", fr: "Manitoba" },
  NB: { en: "New Brunswick", fr: "Nouveau-Brunswick" },
  NL: { en: "Newfoundland and Labrador", fr: "Terre-Neuve-et-Labrador" },
  NS: { en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  NT: { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" },
  NU: { en: "Nunavut", fr: "Nunavut" },
  ON: { en: "Ontario", fr: "Ontario" },
  PE: { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
  QC: { en: "Quebec", fr: "Québec" },
  SK: { en: "Saskatchewan", fr: "Saskatchewan" },
  YT: { en: "Yukon", fr: "Yukon" },
};

/** Loose Canadian pattern: letter-digit-letter, optional space, digit-letter-digit. */
export const POSTAL_CODE_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

/** "k1a0b1" / "K1A  0B1" -> "K1A 0B1". Returns the input unchanged if it doesn't match. */
export function normalizePostalCode(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact)) return raw.trim();
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

export const MAX_ADDRESSES = 10;

/** The subset of the Address row the UI needs. */
export type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

/**
 * Error codes returned by the account actions. Kept as codes rather than
 * sentences so the client can show them in the visitor's language.
 */
export type AccountError =
  | "unauthorized"
  | "invalid"
  | "invalid_phone"
  | "invalid_postal"
  | "invalid_province"
  | "password_short"
  | "password_mismatch"
  | "password_wrong"
  | "password_same"
  | "limited"
  | "address_limit"
  | "address_missing"
  | "failed";

export type AccountState = { error?: AccountError; ok?: true } | null;

/** Outcome flags the address list page reads back from ?status=… */
export type AddressListStatus = "saved" | "deleted" | "default";
