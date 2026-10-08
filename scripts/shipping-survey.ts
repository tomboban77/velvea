/**
 * Shipping rate survey — what it actually costs to send a basket to each region.
 *
 *   npm run survey:shipping
 *   npm run survey:shipping -- --box 40x30x30:4 --packing 3
 *
 * Asks ShipTime for real quotes from the studio to a spread of postal codes
 * covering every region we ship to (or might), once for one basket and once
 * for two, and prints a suggested fee table for /admin/delivery-zones.
 *
 * Carriers price by zone, not by distance — Sudbury can cost more than
 * Montréal — which is why this samples several towns per region and takes the
 * worst case rather than fitting a per-km formula.
 *
 * READ-ONLY: it only calls POST /rest/rates/. It never creates a shipment,
 * buys a label or books a pickup, and it does not touch the database.
 *
 * Needs SHIPTIME_CLIENT_ID and SHIPTIME_CLIENT_SECRET in .env (ShipTime →
 * Integrations → My Integrations → ShipTime API). Prints no secrets.
 *
 * Costs are taken from `totalCharge`, i.e. WITH tax: Velvea is not GST/HST
 * registered, so the tax on a label is a real cost we can't claim back.
 */

const API = (process.env.SHIPTIME_API_URL ?? "https://restapi.shiptime.com").replace(/\/+$/, "").replace(/\/rest$/, "");

// --- Options -----------------------------------------------------------------

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** "LxWxH:KG" in cm / kg. Default is a typical mid-size basket box. */
const boxSpec = arg("box") ?? "40x30x30:4";
const m = boxSpec.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
if (!m) {
  console.error(`--box must look like 40x30x30:4 (cm x cm x cm : kg), got "${boxSpec}"`);
  process.exit(1);
}
const BOX = { length: +m[1], width: +m[2], height: +m[3], weight: +m[4] };

/** Box, tissue, padding and tape per parcel, in dollars. */
const PACKING_CENTS = Math.round(Number(arg("packing") ?? "3") * 100);

/**
 * Carriers we'd hand a food gift to. Cheaper names exist in the quote list,
 * but a basket stuck in a depot for a week costs more than the $3 saved.
 */
const TRUSTED = /purolator|canpar|canada post|ups|fedex|loomis|gls/i;

// --- Destinations ----------------------------------------------------------------
//
// Grouped by the zone they'd belong to. `on-ground` and `on-north` exist
// already (prisma/zones.ts); the rest are proposals. Postal codes are real
// city-hall / downtown codes so carriers don't reject them as invalid. City
// names are unaccented: ShipTime rejects "Montréal" against H2Y as a mismatch.

type Dest = { zone: string; city: string; prov: string; postal: string; maxDays: number };

const DESTS: Dest[] = [
  { zone: "on-ground", city: "Hamilton", prov: "ON", postal: "L8P 4Y5", maxDays: 3 },
  { zone: "on-ground", city: "Barrie", prov: "ON", postal: "L4M 3B4", maxDays: 3 },
  { zone: "on-ground", city: "London", prov: "ON", postal: "N6A 4L9", maxDays: 3 },
  { zone: "on-ground", city: "Windsor", prov: "ON", postal: "N9A 6S1", maxDays: 3 },
  { zone: "on-ground", city: "Kingston", prov: "ON", postal: "K7L 2Z3", maxDays: 3 },
  { zone: "on-ground", city: "Ottawa", prov: "ON", postal: "K1P 1J1", maxDays: 3 },

  { zone: "on-north", city: "Sudbury", prov: "ON", postal: "P3A 5P3", maxDays: 5 },
  { zone: "on-north", city: "North Bay", prov: "ON", postal: "P1B 8H8", maxDays: 5 },
  { zone: "on-north", city: "Sault Ste. Marie", prov: "ON", postal: "P6A 5X6", maxDays: 5 },
  { zone: "on-north", city: "Thunder Bay", prov: "ON", postal: "P7E 5V3", maxDays: 5 },
  { zone: "on-north", city: "Kenora", prov: "ON", postal: "P9N 3X7", maxDays: 5 },

  { zone: "qc", city: "Gatineau", prov: "QC", postal: "J8X 3Y9", maxDays: 3 },
  { zone: "qc", city: "Montreal", prov: "QC", postal: "H2Y 1C6", maxDays: 3 },
  { zone: "qc", city: "Quebec", prov: "QC", postal: "G1R 4S9", maxDays: 4 },
  { zone: "qc", city: "Sherbrooke", prov: "QC", postal: "J1H 4G9", maxDays: 4 },

  { zone: "atlantic", city: "Moncton", prov: "NB", postal: "E1C 1E8", maxDays: 5 },
  { zone: "atlantic", city: "Fredericton", prov: "NB", postal: "E3B 1B5", maxDays: 5 },
  { zone: "atlantic", city: "Halifax", prov: "NS", postal: "B3J 3A5", maxDays: 5 },
  { zone: "atlantic", city: "Charlottetown", prov: "PE", postal: "C1A 7K4", maxDays: 5 },
  { zone: "atlantic", city: "St. John's", prov: "NL", postal: "A1C 5M2", maxDays: 6 },

  { zone: "prairies", city: "Winnipeg", prov: "MB", postal: "R3B 1B9", maxDays: 5 },
  { zone: "prairies", city: "Regina", prov: "SK", postal: "S4P 3C8", maxDays: 6 },
  { zone: "prairies", city: "Saskatoon", prov: "SK", postal: "S7K 0J5", maxDays: 6 },
  { zone: "prairies", city: "Calgary", prov: "AB", postal: "T2P 2M5", maxDays: 6 },
  { zone: "prairies", city: "Edmonton", prov: "AB", postal: "T5J 2R7", maxDays: 6 },

  { zone: "bc", city: "Vancouver", prov: "BC", postal: "V5Y 1V4", maxDays: 7 },
  { zone: "bc", city: "Victoria", prov: "BC", postal: "V8W 1P6", maxDays: 7 },
  { zone: "bc", city: "Kelowna", prov: "BC", postal: "V1Y 1J4", maxDays: 7 },
  { zone: "bc", city: "Prince George", prov: "BC", postal: "V2L 3V9", maxDays: 7 },

  { zone: "yukon", city: "Whitehorse", prov: "YT", postal: "Y1A 1C2", maxDays: 8 },
];

const FROM = {
  companyName: "Velvea Gifts",
  attention: "Velvea",
  streetAddress: "5105 Hurontario Street",
  city: "Mississauga",
  state: "ON",
  countryCode: "CA",
  postalCode: "L4Z3X7",
  phone: "431 726 1706",
  residential: false,
};

// --- API -------------------------------------------------------------------------

type Money = { amount: number; currency: string };
type Quote = {
  carrierName: string;
  serviceName: string;
  transitDays?: number;
  transitDaysMax?: number;
  totalCharge: Money;
  totalBeforeTaxes?: Money;
};

async function authHeader(): Promise<string> {
  const id = process.env.SHIPTIME_CLIENT_ID;
  const secret = process.env.SHIPTIME_CLIENT_SECRET;
  if (!id || !secret) {
    console.error("Missing SHIPTIME_CLIENT_ID / SHIPTIME_CLIENT_SECRET in .env");
    process.exit(1);
  }
  // Production is OAuth client-credentials; the sandbox is Basic auth. Try
  // the token first and only fall back if the endpoint refuses outright.
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (res.ok) {
    const body = (await res.json()) as { access_token?: string };
    if (body.access_token) return `Bearer ${body.access_token}`;
  }
  console.warn(`Token endpoint answered ${res.status}; falling back to Basic auth.`);
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

function nextBusinessDay(): string {
  const d = new Date();
  do d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6);
  return d.toISOString().slice(0, 10);
}

async function rates(auth: string, dest: Dest, parcels: number): Promise<Quote[]> {
  const res = await fetch(`${API}/rest/rates/`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: {
        companyName: "Recipient",
        attention: "Recipient",
        streetAddress: "100 Main Street",
        city: dest.city,
        state: dest.prov,
        countryCode: "CA",
        postalCode: dest.postal.replace(/\s/g, ""),
        phone: "416 555 0100",
        residential: true, // most gifts go to homes; the surcharge is real
      },
      packageType: "PACKAGE",
      unitOfMeasurement: "METRIC",
      shipDate: nextBusinessDay(),
      waitTimeLimit: 30,
      lineItems: Array.from({ length: parcels }, () => ({ ...BOX, description: "Gift basket" })),
    }),
  });
  if (res.status === 401) throw new Error("401 Unauthorized — check the ShipTime client ID/secret");
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { availableRates?: Quote[]; messages?: unknown[] };
  return body.availableRates ?? [];
}

// --- Survey ----------------------------------------------------------------------

const $ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const days = (q: Quote) =>
  q.transitDays == null ? "?" : q.transitDaysMax && q.transitDaysMax !== q.transitDays ? `${q.transitDays}-${q.transitDaysMax}` : `${q.transitDays}`;

/** Cheapest trusted carrier inside the region's delivery window. */
function pick(quotes: Quote[], maxDays: number): Quote | undefined {
  return quotes
    .filter((q) => TRUSTED.test(q.carrierName) && (q.transitDays ?? 99) <= maxDays)
    .sort((a, b) => a.totalCharge.amount - b.totalCharge.amount)[0];
}

/** Round up to a .99 price, e.g. 2731 → 2799. */
const toNinetyNine = (cents: number) => Math.ceil((cents + 1) / 100) * 100 - 1;

type Row = { dest: Dest; one?: Quote; two?: Quote; cheapest?: Quote; error?: string };

async function main() {
  console.log(`Box ${BOX.length}x${BOX.width}x${BOX.height} cm, ${BOX.weight} kg · packing ${$(PACKING_CENTS)}/parcel · ${API}\n`);
  const auth = await authHeader();

  const rows: Row[] = [];
  // A few at a time: each rate call fans out to a dozen carriers server-side.
  for (let i = 0; i < DESTS.length; i += 3) {
    const batch = DESTS.slice(i, i + 3);
    rows.push(
      ...(await Promise.all(
        batch.map(async (dest): Promise<Row> => {
          try {
            const [q1, q2] = await Promise.all([rates(auth, dest, 1), rates(auth, dest, 2)]);
            const cheapest = [...q1].sort((a, b) => a.totalCharge.amount - b.totalCharge.amount)[0];
            const one = pick(q1, dest.maxDays);
            // Two parcels are booked as their own shipment, so pick them on their
            // own merits: matching the one-parcel carrier left Canada Post blank
            // (no multi-piece quote) and let GLS's $78 to St. John's set the fee.
            const two = pick(q2, dest.maxDays);
            return { dest, one, two, cheapest };
          } catch (e) {
            return { dest, error: (e as Error).message };
          }
        }),
      )),
    );
    process.stdout.write(`  quoted ${rows.length}/${DESTS.length}\r`);
  }

  console.log("\n\nPer destination (tax-inclusive label cost)\n");
  console.log("| Zone | City | Recommended | Days | 1 basket | 2 baskets | Cheapest any |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    if (r.error || !r.one) {
      console.log(`| ${r.dest.zone} | ${r.dest.city} | — | | | | ${r.error ?? (r.cheapest ? `${r.cheapest.carrierName} ${$(r.cheapest.totalCharge.amount)} (none trusted within ${r.dest.maxDays}d)` : "no rates")} |`);
      continue;
    }
    console.log(
      `| ${r.dest.zone} | ${r.dest.city} | ${r.one.carrierName} ${r.one.serviceName} | ${days(r.one)} | ${$(r.one.totalCharge.amount)} | ${r.two ? $(r.two.totalCharge.amount) : "?"} | ${r.cheapest ? `${r.cheapest.carrierName} ${$(r.cheapest.totalCharge.amount)}` : ""} |`,
    );
  }

  // Worst case per zone: the fee has to cover the dearest town in it.
  console.log("\nSuggested zone fees (worst town in zone + packing, rounded up to .99)\n");
  console.log("| Zone | Base fee | Each extra basket | Delivery days | Priced from |");
  console.log("|---|---|---|---|---|");
  for (const zone of [...new Set(DESTS.map((d) => d.zone))]) {
    const ok = rows.filter((r) => r.dest.zone === zone && r.one);
    if (!ok.length) {
      console.log(`| ${zone} | no quotes | | | |`);
      continue;
    }
    const worst = ok.reduce((a, b) => (b.one!.totalCharge.amount > a.one!.totalCharge.amount ? b : a));
    const base = toNinetyNine(worst.one!.totalCharge.amount + PACKING_CENTS);
    const extras = ok.filter((r) => r.two).map((r) => r.two!.totalCharge.amount - r.one!.totalCharge.amount);
    const extra = extras.length ? toNinetyNine(Math.max(...extras) + PACKING_CENTS) : null;
    const minD = Math.min(...ok.map((r) => r.one!.transitDays ?? 99));
    const maxD = Math.max(...ok.map((r) => r.one!.transitDaysMax ?? r.one!.transitDays ?? 0));
    console.log(`| ${zone} | ${$(base)} | ${extra == null ? "?" : $(extra)} | ${minD}-${maxD} | ${worst.dest.city} |`);
  }
  console.log("\nQuotes only — nothing was booked. Rates and fuel surcharges move; re-run every few months.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
