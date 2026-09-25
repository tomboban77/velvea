/**
 * Move a set of FSAs from one delivery zone to another.
 *
 * Zones are live business rules: an FSA's zone decides the fee, the same-day
 * cutoff and the lead time quoted at checkout, so moving one changes what the
 * storefront promises. This script therefore prints the full before/after and
 * changes nothing unless `--apply` is passed, in the same spirit as
 * `audit-alcohol.ts`.
 *
 *   npx tsx scripts/move-delivery-fsas.ts            # dry run, prints the diff
 *   npx tsx scripts/move-delivery-fsas.ts --apply    # writes it
 *
 * Added 24 Sept 2026 for the Burlington / Georgetown / Bolton move into the
 * Brampton-Oakville-Milton zone.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FROM = "local-c";
const TO = "local-b-west";

/**
 * Burlington is the whole city. Georgetown is L7G only — L7J is Acton, a
 * different Halton Hills town. Bolton is L7E only — L7C and L7K are other
 * parts of Caledon. Moving more than this would promise same-day delivery to
 * towns nobody agreed to serve same-day.
 */
const MOVE: Record<string, string[]> = {
  Burlington: ["L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T"],
  Georgetown: ["L7G"],
  Bolton: ["L7E"],
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

async function main() {
  const apply = process.argv.includes("--apply");

  const [from, to] = await Promise.all([
    prisma.deliveryZone.findUnique({ where: { key: FROM } }),
    prisma.deliveryZone.findUnique({ where: { key: TO } }),
  ]);

  if (!from || !to) {
    console.error(`Missing zone: ${!from ? FROM : ""} ${!to ? TO : ""}`.trim());
    process.exit(1);
  }

  const moving = Object.values(MOVE).flat();

  console.log(`\nFrom: ${FROM} — ${money(from.baseFeeCents)}, same-day ${from.sameDayCutoff ?? "not offered"}, lead ${from.minLeadDays}-${from.maxLeadDays}d`);
  console.log(`To:   ${TO} — ${money(to.baseFeeCents)}, same-day ${to.sameDayCutoff ?? "not offered"}, lead ${to.minLeadDays}-${to.maxLeadDays}d\n`);

  let blocked = false;
  for (const [city, fsas] of Object.entries(MOVE)) {
    for (const f of fsas) {
      const state = from.fsaPrefixes.includes(f)
        ? "ok — in " + FROM
        : to.fsaPrefixes.includes(f)
        ? "skip — already in " + TO
        : "MISSING — in neither zone";
      if (state.startsWith("MISSING")) blocked = true;
      console.log(`  ${city.padEnd(11)} ${f}  ${state}`);
    }
  }

  const nextFrom = from.fsaPrefixes.filter((f) => !moving.includes(f));
  const nextTo = [...new Set([...to.fsaPrefixes, ...moving.filter((f) => from.fsaPrefixes.includes(f))])];

  console.log(`\n  ${FROM}: ${from.fsaPrefixes.length} -> ${nextFrom.length} FSAs`);
  console.log(`  ${TO}: ${to.fsaPrefixes.length} -> ${nextTo.length} FSAs`);
  console.log(`\n  Moved FSAs change: fee ${money(from.baseFeeCents)} -> ${money(to.baseFeeCents)}, ` +
    `same-day ${from.sameDayCutoff ?? "none"} -> ${to.sameDayCutoff ?? "none"}` +
    (to.sameDaySurchargeCents ? ` (+${money(to.sameDaySurchargeCents)})` : "") +
    `, lead ${from.minLeadDays}-${from.maxLeadDays}d -> ${to.minLeadDays}-${to.maxLeadDays}d`);

  if (blocked) {
    console.error("\nOne or more FSAs were found in neither zone. Nothing written — investigate first.");
    process.exit(1);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write these changes.\n");
    return;
  }

  // One transaction: a half-applied move would leave an FSA in both zones or
  // in neither, and resolveZone would then quote the wrong fee.
  await prisma.$transaction([
    prisma.deliveryZone.update({ where: { key: FROM }, data: { fsaPrefixes: nextFrom } }),
    prisma.deliveryZone.update({ where: { key: TO }, data: { fsaPrefixes: nextTo } }),
  ]);

  console.log("\nApplied.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
