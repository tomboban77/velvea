/**
 * Does the city the customer typed belong to the postal code they typed?
 *
 * The postal code alone sets the delivery fee and whether same-day is offered
 * (src/lib/zones.ts), and nothing used to compare it with the rest of the
 * address. An Oshawa street with a Mississauga postal code was priced at the
 * Mississauga rate and offered same-day, and the driver only found out on the
 * road. Every FSA we drive to is listed here with the municipality names
 * Canada Post accepts for it, and a local order whose city is not one of them
 * is refused rather than flagged (owner decision, 5 Nov 2026).
 *
 * Neighbourhood names are accepted only for the FSAs they sit in, so typing
 * "Bolton" with a Caledon East postal code still fails. What this cannot catch
 * is a street from somewhere else typed with a postal code and city that agree
 * with each other; only a street-level lookup would.
 *
 * Shipped orders are priced by province, so for them the check only refuses a
 * known local city name paired with a postal code from somewhere else.
 *
 * Pure module: no database, so the tests can import it directly.
 */

type Place = {
  /** First name is what the error message shows. */
  names: string[];
  fsas?: string[];
  /** Every FSA starting with this letter, minus `except`. Toronto only. */
  letter?: string;
  except?: string[];
};

const MISSISSAUGA = [
  "L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z",
  "L5A", "L5B", "L5C", "L5E", "L5G", "L5H", "L5J", "L5K", "L5L",
  "L5M", "L5N", "L5P", "L5R", "L5S", "L5T", "L5V", "L5W",
  // The airport and Gateway lands are Mississauga despite the M.
  "M7R",
];
const BRAMPTON = ["L6P", "L6R", "L6S", "L6T", "L6V", "L6W", "L6X", "L6Y", "L6Z", "L7A"];
const VAUGHAN = ["L4H", "L4J", "L4K", "L4L", "L6A", "L3L"];
const MARKHAM = ["L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G"];
const CALEDON = ["L7C", "L7E", "L7K"];

export const LOCAL_PLACES: Place[] = [
  {
    names: [
      "Mississauga", "Malton", "Streetsville", "Port Credit", "Meadowvale", "Clarkson",
      "Cooksville", "Erin Mills", "Erindale", "Lorne Park", "Churchill Meadows", "Lisgar",
      "Lakeview", "Applewood",
    ],
    fsas: MISSISSAUGA,
  },
  {
    names: [
      "Toronto", "Scarborough", "Etobicoke", "North York", "East York", "York", "Willowdale",
      "Don Mills", "Agincourt", "Rexdale", "Weston", "Mimico", "Downsview", "Leaside",
    ],
    letter: "M",
    except: ["M7R"],
  },
  { names: ["Brampton", "Bramalea", "Springdale"], fsas: BRAMPTON },
  { names: ["Oakville", "Bronte", "Glen Abbey"], fsas: ["L6H", "L6J", "L6K", "L6L", "L6M"] },
  { names: ["Milton"], fsas: ["L9E", "L9T"] },
  { names: ["Burlington", "Aldershot"], fsas: ["L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T"] },
  { names: ["Halton Hills"], fsas: ["L7G", "L7J"] },
  { names: ["Georgetown", "Glen Williams"], fsas: ["L7G"] },
  { names: ["Acton"], fsas: ["L7J"] },
  {
    names: ["Caledon", "Caledon East", "Caledon Village", "Inglewood", "Cheltenham", "Alton", "Belfountain", "Palgrave"],
    fsas: CALEDON,
  },
  { names: ["Bolton"], fsas: ["L7E"] },
  { names: ["Vaughan"], fsas: VAUGHAN },
  { names: ["Woodbridge"], fsas: ["L4H", "L4L", "L3L"] },
  { names: ["Kleinburg"], fsas: ["L4H"] },
  { names: ["Maple"], fsas: ["L6A"] },
  { names: ["Concord"], fsas: ["L4K"] },
  // Thornhill straddles Vaughan (L4J) and Markham (L3T).
  { names: ["Thornhill"], fsas: ["L4J", "L3T"] },
  { names: ["Richmond Hill"], fsas: ["L4B", "L4C", "L4E", "L4S"] },
  { names: ["Oak Ridges"], fsas: ["L4E"] },
  { names: ["Markham"], fsas: MARKHAM },
  { names: ["Unionville"], fsas: ["L3R", "L6C", "L6G"] },
  { names: ["Cornell"], fsas: ["L6B"] },
  { names: ["Pickering"], fsas: ["L1V", "L1W", "L1X", "L1Y"] },
  { names: ["Ajax"], fsas: ["L1S", "L1T", "L1Z"] },
  { names: ["Whitby"], fsas: ["L1M", "L1N", "L1P", "L1R"] },
  { names: ["Brooklin"], fsas: ["L1M"] },
  { names: ["Oshawa"], fsas: ["L1G", "L1H", "L1J", "L1K", "L1L"] },
  { names: ["Clarington"], fsas: ["L1B", "L1C", "L1E"] },
  { names: ["Newcastle"], fsas: ["L1B"] },
  { names: ["Bowmanville"], fsas: ["L1C"] },
  { names: ["Courtice"], fsas: ["L1E"] },
  { names: ["Newmarket"], fsas: ["L3X", "L3Y"] },
  { names: ["Aurora"], fsas: ["L4G"] },
  { names: ["Whitchurch-Stouffville", "Stouffville", "Ballantrae"], fsas: ["L4A"] },
  { names: ["King", "King City"], fsas: ["L7B"] },
];

function covers(place: Place, fsa: string): boolean {
  if (place.fsas?.includes(fsa)) return true;
  return Boolean(place.letter && fsa.startsWith(place.letter) && !place.except?.includes(fsa));
}

/** Whether checkout can check addresses in this FSA (the admin zone form asks). */
export function isKnownLocalFsa(fsa: string): boolean {
  return LOCAL_PLACES.some((p) => covers(p, fsa));
}

/** Whether a whole postal-code letter is covered, as Toronto's "M" is. */
export function isKnownLocalLetter(letter: string): boolean {
  return LOCAL_PLACES.some((p) => p.letter === letter);
}

/** Compare city names without case, accents, punctuation or a trailing ", ON". */
export function normalizeCity(city: string): string {
  const first = city.split(",")[0] ?? "";
  return first
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(ontario|on)\s*$/, "")
    .replace(/[^a-z]/g, "");
}

/**
 * A full Canadian postal code, "A1A 1A1", or null. Canada Post never uses D, F,
 * I, O, Q or U, and never starts a code with W or Z, so those are typos.
 */
export function normalizePostalCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(s)) return null;
  return `${s.slice(0, 3)} ${s.slice(3)}`;
}

export type CityCheck =
  | { ok: true }
  /** The postal code is one we drive to and the city is not one of its names. */
  | { ok: false; reason: "mismatch"; expected: string[] }
  /** A local zone covers this FSA but it has no entry here: refuse, don't guess. */
  | { ok: false; reason: "unknown-local" }
  /** The city is one we know, but the postal code belongs somewhere else. */
  | { ok: false; reason: "wrong-postal"; city: string };

export function checkCityForPostal(city: string, fsa: string, localZone: boolean): CityCheck {
  const typed = normalizeCity(city);
  const here = LOCAL_PLACES.filter((p) => covers(p, fsa));

  if (here.length) {
    if (here.some((p) => p.names.some((n) => normalizeCity(n) === typed))) return { ok: true };
    return { ok: false, reason: "mismatch", expected: [...new Set(here.map((p) => p.names[0]))] };
  }
  if (localZone) return { ok: false, reason: "unknown-local" };

  const known = ONLY_HERE.find((n) => normalizeCity(n) === typed);
  if (known) return { ok: false, reason: "wrong-postal", city: known };
  return { ok: true };
}

/**
 * Names that mean exactly one place in Canada and use no rural (L0x) postal
 * codes, so any postal code outside our list is certainly wrong for them.
 * Pickering, Caledon or Vaughan are left out on purpose: their rural hamlets
 * use L0 codes that ship normally, and Milton or Oakville also exist in other
 * provinces.
 */
const ONLY_HERE = [
  "Mississauga", "Toronto", "Scarborough", "Etobicoke", "North York", "East York",
  "Brampton", "Richmond Hill", "Ajax", "Newmarket",
];
