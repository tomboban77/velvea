/**
 * Read-only: resolve a spread of postal codes against the LIVE zones and print
 * what checkout would charge. Run after any zone change.
 *
 *   npx tsx --env-file=.env scripts/check-zone-routing.ts
 */
import { PrismaClient } from "@prisma/client";
import { resolveZoneFrom } from "../src/lib/zones";

const SAMPLES: [string, string][] = [
  ["Mississauga", "L5B 3C1"],
  ["Toronto", "M5H 2N2"],
  ["Ottawa", "K1P 1J1"],
  ["Sudbury", "P3A 5P3"],
  ["Thunder Bay", "P7E 5V3"],
  ["Kenora", "P9N 3X7"],
  ["Sioux Lookout", "P8T 1B3"],
  ["Sandy Lake (fly-in)", "P0V 1V0"],
  ["Montreal", "H2Y 1C6"],
  ["Quebec City", "G1R 4S9"],
  ["Nunavik (fly-in)", "J0M 1C0"],
  ["Halifax", "B3J 3A5"],
  ["Charlottetown", "C1A 7K4"],
  ["Moncton", "E1C 1E8"],
  ["St. John's", "A1C 5M2"],
  ["Coastal Labrador", "A0P 1C0"],
  ["Calgary", "T2P 2M5"],
  ["Vancouver", "V5Y 1V4"],
  ["Whitehorse", "Y1A 1C2"],
  ["Yellowknife", "X1A 2N2"],
  ["New York (ZIP)", "10001"],
];

async function main() {
  const prisma = new PrismaClient();
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { key: "asc" }],
    });
    for (const [city, postal] of SAMPLES) {
      const m = resolveZoneFrom(zones, postal);
      const out = m.ok
        ? `${m.zone.key}  $${(m.zone.baseFeeCents / 100).toFixed(2)} +$${(m.zone.extraItemCents / 100).toFixed(2)}`
        : `${m.reason}${m.zone ? ` (${m.zone.key})` : ""}`;
      console.log(`${city.padEnd(22)} ${postal.padEnd(8)} -> ${out}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
