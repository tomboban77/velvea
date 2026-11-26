/**
 * Bring the live courier zones in line with prisma/zones.ts.
 *
 *   npm run zones:shipping                 # dry run: prints what would change
 *   npm run zones:shipping -- --apply      # writes the changes
 *
 * Runs against whatever DATABASE_URL .env holds — which is PRODUCTION. That is
 * why the default is a dry run and every write is named before it happens.
 *
 * What --apply does, in one transaction so checkout never sees half of it:
 *   - FEES: updates ONLY the fees and lead days of the existing courier
 *     zones, so FSA lists or names tuned in the admin are left alone.
 *   - ROUTING: the zones whose territory the seed deliberately changed
 *     (atlantic lost Newfoundland on 15 Nov 2026) also get the seed's name,
 *     letters, prefixes and provinces.
 *   - CREATE: zones that do not exist yet are created exactly as seeded,
 *     active flag included. One that already exists is never overwritten.
 *   - OPEN: zones the seed marks active but production still has switched
 *     off (Quebec) are switched on.
 *
 * Order matters and the transaction guarantees it: Newfoundland must exist
 * before atlantic lets go of the letter "A", or St. John's would be unserved
 * for the moment in between.
 *
 * Local (van) zones, pickup and the quote-only zones are never touched.
 * Every change can be reviewed or undone in /admin/delivery-zones.
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { ZONE_SEED } from "../prisma/zones";

const APPLY = process.argv.includes("--apply");

/** Existing zones whose price follows the seed; nothing else about them is touched. */
const FEES = ["on-ground", "on-north", "on-northwest", "qc-ground", "atlantic", "nl", "prairies", "bc"] as const;
/** Zones whose territory and name also follow the seed. */
const ROUTING = ["atlantic"] as const;
/**
 * Zones created from the seed if missing. on-northwest and nl are also in
 * FEES: once they exist their price follows the seed like everyone else's.
 * They were create-only until the 26 Nov 2026 repricing, which would have
 * let a seed change skip them without a word.
 */
const CREATE = ["on-northwest", "nl", "ca-remote", "yukon"] as const;
/** Zones switched on if the seed says active and production says not. */
const OPEN = ["qc-ground"] as const;

const seed = (key: string) => {
  const z = ZONE_SEED.find((s) => s.key === key);
  if (!z) throw new Error(`prisma/zones.ts has no zone "${key}"`);
  return z;
};
const $ = (cents: number | undefined) => `$${((cents ?? 0) / 100).toFixed(2)}`;
const list = (v: unknown) => (Array.isArray(v) ? [...v].sort().join(",") : "");
const sameList = (a: unknown, b: unknown) => list(a) === list(b);

async function main() {
  const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "(unset)";
  console.log(`${APPLY ? "APPLYING to" : "Dry run against"} ${host}\n`);

  const prisma = new PrismaClient();
  try {
    const keys = [...new Set([...FEES, ...ROUTING, ...CREATE, ...OPEN])];
    const live = new Map((await prisma.deliveryZone.findMany({ where: { key: { in: keys } } })).map((z) => [z.key, z]));
    const writes: Prisma.PrismaPromise<unknown>[] = [];

    // Creates first: see the note on ordering above.
    for (const key of CREATE) {
      const s = seed(key);
      const z = live.get(key);
      const price = s.kind === "QUOTE" ? "quote" : `${$(s.baseFeeCents)} +${$(s.extraItemCents)}`;
      if (z) {
        console.log(`  = ${key}: exists (${z.active ? "active" : "inactive"}) — not recreated`);
      } else {
        console.log(
          `  + ${key}: create ${s.kind} ${price}, ${s.active ? "ACTIVE" : "inactive"}` +
            ` [${list(s.fsaPrefixes) || list(s.fsaLetters)}]`,
        );
        writes.push(prisma.deliveryZone.create({ data: s }));
      }
    }

    for (const key of FEES) {
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
      if (!same) writes.push(prisma.deliveryZone.update({ where: { key }, data: next }));
    }

    for (const key of ROUTING) {
      const s = seed(key);
      const z = live.get(key);
      if (!z) continue;
      const next = {
        name: s.name as Prisma.InputJsonValue,
        fsaLetters: (s.fsaLetters as string[] | undefined) ?? [],
        fsaPrefixes: (s.fsaPrefixes as string[] | undefined) ?? [],
        provinces: (s.provinces as string[] | undefined) ?? [],
      };
      const same =
        JSON.stringify(z.name) === JSON.stringify(next.name) &&
        sameList(z.fsaLetters, next.fsaLetters) &&
        sameList(z.fsaPrefixes, next.fsaPrefixes) &&
        sameList(z.provinces, next.provinces);
      console.log(
        same
          ? `  = ${key}: territory already current`
          : `  ~ ${key}: territory letters [${list(z.fsaLetters)}] prefixes [${list(z.fsaPrefixes)}] provinces [${list(z.provinces)}]` +
              ` -> letters [${list(next.fsaLetters)}] prefixes [${list(next.fsaPrefixes)}] provinces [${list(next.provinces)}],` +
              ` name "${(z.name as { en?: string })?.en}" -> "${(next.name as { en?: string }).en}"`,
      );
      if (!same) writes.push(prisma.deliveryZone.update({ where: { key }, data: next }));
    }

    for (const key of OPEN) {
      const z = live.get(key);
      if (!z || !seed(key).active) continue;
      console.log(z.active ? `  = ${key}: already active` : `  ~ ${key}: inactive -> ACTIVE`);
      if (!z.active) writes.push(prisma.deliveryZone.update({ where: { key }, data: { active: true } }));
    }

    if (APPLY && writes.length) await prisma.$transaction(writes);
    console.log(
      APPLY
        ? `\nDone: ${writes.length} change(s). Checkout picks them up within ~30s (zone cache). Review in /admin/delivery-zones.`
        : `\nNothing written (${writes.length} change(s) pending). Re-run with --apply to make them.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
