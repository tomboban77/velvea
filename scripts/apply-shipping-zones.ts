/**
 * Apply the Oct 2026 shipping-survey rates to the live delivery zones.
 *
 *   npm run zones:shipping                 # dry run: prints what would change
 *   npm run zones:shipping -- --apply      # writes the changes
 *   npm run zones:shipping -- --apply --activate   # later: open the new provinces
 *
 * Runs against whatever DATABASE_URL .env holds — which is PRODUCTION. That is
 * why the default is a dry run and every write is named before it happens.
 *
 * What --apply does:
 *   - on-ground / on-north: updates ONLY the fees and lead days, so FSA
 *     lists or names tuned in the admin are left alone.
 *   - the new zones (Quebec, Atlantic, Prairies, BC, Yukon, remote carve-out):
 *     created from prisma/zones.ts, INACTIVE. A zone that already exists is
 *     reported and skipped, never overwritten.
 *
 * --activate switches all of the new zones on together. Do it only after the
 * "Ontario only" copy across the site has been updated (see
 * docs/LAUNCH-CHECKLIST.md): until then checkout would sell to Calgary while
 * the shipping page says we don't go there. The remote carve-out activates
 * in the same breath so fly-in addresses are never sold a road rate.
 *
 * Every change can be reviewed or undone in /admin/delivery-zones.
 */
import { PrismaClient } from "@prisma/client";
import { ZONE_SEED } from "../prisma/zones";

const APPLY = process.argv.includes("--apply");
const ACTIVATE = process.argv.includes("--activate");

/** Existing zones whose price changes; nothing else about them is touched. */
const REPRICE = ["on-ground", "on-north"] as const;
/** Zones introduced by the national-shipping work. */
const NEW = ["ca-remote", "qc-ground", "atlantic", "prairies", "bc", "yukon"] as const;

const seed = (key: string) => {
  const z = ZONE_SEED.find((s) => s.key === key);
  if (!z) throw new Error(`prisma/zones.ts has no zone "${key}"`);
  return z;
};
const $ = (cents: number | undefined) => `$${((cents ?? 0) / 100).toFixed(2)}`;

async function main() {
  if (ACTIVATE && !APPLY) {
    console.error("--activate only makes sense with --apply.");
    process.exit(1);
  }
  const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "(unset)";
  console.log(`${APPLY ? "APPLYING to" : "Dry run against"} ${host}\n`);

  const prisma = new PrismaClient();
  try {
    const live = new Map(
      (await prisma.deliveryZone.findMany({ where: { key: { in: [...REPRICE, ...NEW] } } })).map((z) => [z.key, z]),
    );

    for (const key of REPRICE) {
      const s = seed(key);
      const z = live.get(key);
      if (!z) {
        console.log(`  ! ${key}: not in the database — skipped (create it in the admin)`);
        continue;
      }
      const next = {
        baseFeeCents: s.baseFeeCents ?? 0,
        extraItemCents: s.extraItemCents ?? 0,
        minLeadDays: s.minLeadDays ?? 1,
        maxLeadDays: s.maxLeadDays ?? 3,
      };
      const same =
        z.baseFeeCents === next.baseFeeCents &&
        z.extraItemCents === next.extraItemCents &&
        z.minLeadDays === next.minLeadDays &&
        z.maxLeadDays === next.maxLeadDays;
      console.log(
        `  ${same ? "=" : "~"} ${key}: ${$(z.baseFeeCents)} +${$(z.extraItemCents)} (${z.minLeadDays}-${z.maxLeadDays}d)` +
          (same ? " — already current" : ` -> ${$(next.baseFeeCents)} +${$(next.extraItemCents)} (${next.minLeadDays}-${next.maxLeadDays}d)`),
      );
      if (!same && APPLY) await prisma.deliveryZone.update({ where: { key }, data: next });
    }

    for (const key of NEW) {
      const s = seed(key);
      const z = live.get(key);
      const price = s.kind === "QUOTE" ? "quote" : `${$(s.baseFeeCents)} +${$(s.extraItemCents)}`;
      if (z) {
        console.log(`  = ${key}: exists (${z.active ? "active" : "inactive"}) — left as is`);
      } else {
        console.log(`  + ${key}: create ${s.kind} ${price}, inactive`);
        if (APPLY) await prisma.deliveryZone.create({ data: { ...s, active: false } });
      }
    }

    if (ACTIVATE) {
      const { count } = await prisma.deliveryZone.updateMany({ where: { key: { in: [...NEW] } }, data: { active: true } });
      console.log(`\n  Activated ${count} zone(s). Checkout serves them within ~30s (zone cache).`);
    }

    console.log(APPLY ? "\nDone. Review in /admin/delivery-zones." : "\nNothing written. Re-run with --apply to make these changes.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
