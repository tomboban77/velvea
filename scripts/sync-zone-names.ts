/**
 * Report (and optionally fix) drift between the zone names in `prisma/zones.ts`
 * and the names actually stored in the database.
 *
 * Zone names are shown to customers at checkout ("Delivering to …"), and they
 * are editable in admin, so the seed and the live row drift apart silently.
 * That already happened once: Burlington was moved out of `local-c` in admin
 * but the zone kept the name "Local C — Durham, Burlington, north GTA", so
 * every Durham customer saw Burlington in their delivery zone.
 *
 * Names only. Fees, FSAs, cutoffs and lead times are deliberately left alone —
 * those are operational settings the owner edits in admin, and the seed is not
 * authoritative for them once the store is live.
 *
 *   npx tsx scripts/sync-zone-names.ts            # report drift, change nothing
 *   npx tsx scripts/sync-zone-names.ts --apply    # overwrite live names from the seed
 *
 * Read the report before applying: a difference can mean the seed is stale
 * rather than the database being wrong.
 */
import { PrismaClient } from "@prisma/client";
import { ZONE_SEED } from "../prisma/zones";

const prisma = new PrismaClient();

type Name = { en: string; fr: string };

const asName = (v: unknown): Name => {
  const o = (v ?? {}) as Record<string, string>;
  return { en: o.en ?? "", fr: o.fr ?? "" };
};

async function main() {
  const apply = process.argv.includes("--apply");

  const live = await prisma.deliveryZone.findMany({ select: { key: true, name: true } });
  const liveByKey = new Map(live.map((z) => [z.key, asName(z.name)]));

  const drifted: { key: string; from: Name; to: Name }[] = [];
  const missing: string[] = [];

  for (const seed of ZONE_SEED) {
    const seedName = asName(seed.name);
    const current = liveByKey.get(seed.key);
    if (!current) {
      missing.push(seed.key);
      continue;
    }
    if (current.en !== seedName.en || current.fr !== seedName.fr) {
      drifted.push({ key: seed.key, from: current, to: seedName });
    }
  }

  const extra = live.filter((z) => !ZONE_SEED.some((s) => s.key === z.key)).map((z) => z.key);

  if (missing.length) console.log(`In the seed but not in the database: ${missing.join(", ")}`);
  if (extra.length) console.log(`In the database but not in the seed: ${extra.join(", ")}`);

  if (!drifted.length) {
    console.log("\nAll zone names match the seed. Nothing to do.\n");
    return;
  }

  console.log(`\n${drifted.length} zone name(s) differ from the seed:\n`);
  for (const d of drifted) {
    console.log(`  ${d.key}`);
    console.log(`    db   en: ${d.from.en}`);
    console.log(`    seed en: ${d.to.en}`);
    console.log(`    db   fr: ${d.from.fr}`);
    console.log(`    seed fr: ${d.to.fr}\n`);
  }

  if (!apply) {
    console.log("Dry run. Re-run with --apply to overwrite the database names from the seed.\n");
    return;
  }

  await prisma.$transaction(
    drifted.map((d) =>
      prisma.deliveryZone.update({ where: { key: d.key }, data: { name: d.to } })
    )
  );
  console.log(`Applied ${drifted.length} name update(s).\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
