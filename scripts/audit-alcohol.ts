/**
 * Alcohol audit.
 *
 *   npm run audit:alcohol          report only
 *   npm run audit:alcohol -- --fix take anything flagged off sale
 *
 * We hold no AGCO authorisation, so nothing alcoholic may be listed or sold —
 * buying at retail and reselling it inside a hamper is exactly the resale that
 * a licence exists to permit. Run this before launching new products or after
 * any bulk import, because the risk arrives with the catalogue, not the code.
 *
 * Deliberately noisy rather than clever: it flags on a word match and expects a
 * human to clear the false positives (a "wine glass", a "beer bread mix"),
 * which is the right way round for a compliance check.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FIX = process.argv.includes("--fix");

const TERMS = [
  "wine", "beer", "vodka", "gin", "rum", "whisky", "whiskey", "liqueur",
  "champagne", "prosecco", "cider", "spirits", "bourbon", "tequila",
  "brandy", "sake", "vermouth", "aperitif", "alcohol",
];

/**
 * "non-alcoholic" and friends are the opposite of a problem. "Champagne Toast"
 * is a Bath & Body Works candle scent, not a drink; it sits in the Rosé Glow
 * basket and would otherwise flag on every run.
 */
const CLEARED = [
  "non-alcoholic", "non alcoholic", "alcohol-free", "alcohol free", "nonalcoholic",
  "de-alcoholised", "dealcoholized",
  "champagne toast",
];

function hits(text: string): string[] {
  let scrubbed = text.toLowerCase();
  for (const c of CLEARED) scrubbed = scrubbed.split(c).join(" ");
  return TERMS.filter((t) => new RegExp(`\\b${t}`, "i").test(scrubbed));
}

const en = (v: unknown) => (v as { en?: string })?.en ?? "";

async function main() {
  // Something already off sale is not a problem, only a note. Counting it
  // would leave the audit permanently reporting failures, which is the fastest
  // way to teach everyone to ignore it.
  let onSale = 0;
  let parked = 0;

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, contents: true, status: true },
  });
  for (const p of products) {
    const contents = Array.isArray(p.contents)
      ? (p.contents as unknown[]).map(en).join(" | ")
      : "";
    const found = hits(`${en(p.name)} ${contents}`);
    if (!found.length) continue;
    const live = p.status !== "ARCHIVED";
    if (live) onSale++;
    else parked++;
    console.log(
      `${live ? "ON SALE " : "parked  "} PRODUCT     ${en(p.name) || p.slug}  [${found.join(", ")}]`
    );
    if (FIX && live) {
      await prisma.product.update({ where: { id: p.id }, data: { status: "ARCHIVED" } });
      console.log("          -> archived");
    }
  }

  const items = await prisma.builderItem.findMany({ select: { id: true, name: true, active: true } });
  for (const i of items) {
    const found = hits(en(i.name));
    if (!found.length) continue;
    if (i.active) onSale++;
    else parked++;
    console.log(
      `${i.active ? "ON SALE " : "parked  "} ADD-ON      ${en(i.name)}  [${found.join(", ")}]`
    );
    if (FIX && i.active) {
      await prisma.builderItem.update({ where: { id: i.id }, data: { active: false } });
      console.log("          -> taken off sale");
    }
  }

  const collections = await prisma.collection.findMany({ select: { id: true, slug: true, name: true } });
  for (const c of collections) {
    const found = hits(`${c.slug.split("-").join(" ")} ${en(c.name)}`);
    if (!found.length) continue;
    onSale++; // a browsable collection is always customer-facing
    console.log(`ON SALE  COLLECTION  ${en(c.name) || c.slug}  [${found.join(", ")}]`);
    if (FIX) {
      await prisma.collection.delete({ where: { id: c.id } });
      console.log("          -> removed");
    }
  }

  if (onSale === 0) {
    console.log(
      parked === 0
        ? "Clean - nothing alcoholic exists in the catalogue."
        : `Clean - nothing alcoholic is on sale (${parked} kept on file, off sale).`
    );
    return;
  }

  console.log(
    `\n${onSale} item(s) are ON SALE and look alcoholic.` +
      (FIX ? "" : " Re-run with --fix to take them off sale.")
  );
  // Non-zero so this can gate a deploy rather than just print into a log.
  process.exitCode = 1;
}

main().finally(() => prisma.$disconnect());
