/**
 * Set up the Diwali 2026 collection.
 *
 *   npm run diwali:collection            report only — shows what would change
 *   npm run diwali:collection -- --write apply
 *
 * Report-only by default because the local `.env` DATABASE_URL points at the
 * production database (same shape as `seed:guides` and `audit:alcohol`).
 *
 * What it does:
 *   1. Creates (or refreshes the copy of) the OCCASION collection `diwali`.
 *      An existing image, position and featured flag are left alone.
 *   2. Adds the baskets in PICKS, in that order, skipping any that are not
 *      ACTIVE or that mention something a vegetarian Diwali household may not
 *      eat. Many households are strictly vegetarian, and the Diwali guide tells
 *      customers we will say exactly what is inside, so a gelatine gummy or a
 *      salami stick is a reason to leave a basket out, not a footnote. The word
 *      match is deliberately blunt: a false positive costs one basket on one
 *      page; a false negative is a bad gift. Add a basket by hand in
 *      /admin/collections once you have checked it.
 *   3. Points the live Diwali guide's closing call-to-action at the collection
 *      (the source in scripts/guides/diwali-gift-hampers.ts already does), so
 *      it does not need `seed:guides --force`, which would rewrite every
 *      published guide.
 *
 * Safe to re-run: links are upserted and the guide edit only applies once.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sanitizeHtml } from "../src/lib/sanitize";

const prisma = new PrismaClient();
const WRITE = process.argv.includes("--write");

const SLUG = "diwali";

const COPY = {
  name: { en: "Diwali", fr: "Diwali" },
  description: {
    en: "Shareable, alcohol-free gift baskets for Diwali, hand-packed in Mississauga and delivered across Brampton, Mississauga and the GTA in the days before the festival.",
    fr: "Des paniers-cadeaux sans alcool à partager pour Diwali, assemblés à la main à Mississauga et livrés à Brampton, à Mississauga et dans le Grand Toronto avant la fête.",
  },
  seoTitle: {
    en: "Diwali Gift Baskets & Hampers – Mississauga, Brampton, GTA",
    fr: "Paniers-cadeaux de Diwali – Mississauga, Brampton, GTA",
  },
  seoDescription: {
    en: "Diwali gift baskets and hampers for family, clients and teams. Alcohol-free, hand-packed in Mississauga, delivered across the GTA.",
    fr: "Paniers-cadeaux de Diwali pour la famille, les clients et les équipes. Sans alcool, assemblés à Mississauga, livrés dans le Grand Toronto.",
  },
};

/**
 * Shareable and shelf-stable first (what gets offered round during a week of
 * guests), then a pampering basket for the host. Anything named for another
 * occasion (Birthday, Thanksgiving) or "Rosé" — which reads as wine next to a
 * festival many guests mark alcohol-free — is left out on purpose.
 */
const PICKS = [
  "cocoa-clementine-gift-basket",
  "sweet-savoury-snack-hatbox",
  "coffee-comfort-basket",
  "chocolate-rose-garden-crate",
  "grand-chocolate-bloom-basket",
  "blush-bloom-self-care-basket",
  "amber-glow-beauty-basket",
];

const NOT_VEGETARIAN = [
  "gelatin", "gelatine", "gummy", "gummies", "gummi", "marshmallow", "jelly bean", "wine gum",
  "licorice", "liquorice", "jerky", "salami", "prosciutto", "pepperoni", "sausage", "bacon",
  "beef", "pork", "chicken", "anchov", "tuna", "salmon", "fish", "meat",
];

const GUIDE_SLUG = "diwali-gift-hampers-gta";
const GUIDE_EDITS = {
  en: [
    'Start with <a href="/recipients/family">baskets for the family</a> or browse',
    'Start with our <a href="/occasions/diwali">Diwali gift baskets</a>, or browse',
  ],
  fr: [
    'Commencez par les <a href="/fr/recipients/family">paniers pour la famille</a> ou parcourez',
    'Commencez par nos <a href="/fr/occasions/diwali">paniers-cadeaux de Diwali</a>, ou parcourez',
  ],
} as const;

/** Every English string anywhere in a JSON column, flattened for word matching. */
function textOf(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).join(" ");
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return "en" in o ? textOf(o.en) : Object.values(o).map(textOf).join(" ");
  }
  return "";
}

function flags(text: string): string[] {
  const lower = ` ${text.toLowerCase().replace(/<[^>]+>/g, " ")} `;
  return NOT_VEGETARIAN.filter((term) => lower.includes(term));
}

async function main() {
  console.log(WRITE ? "Applying…\n" : "Report only — pass -- --write to apply.\n");

  // 1 · Collection
  const existing = await prisma.collection.findUnique({ where: { slug: SLUG }, select: { id: true } });
  let collectionId = existing?.id;
  if (existing) {
    console.log(`COLLECTION  /occasions/${SLUG} exists — refreshing name, description and SEO copy`);
    if (WRITE) await prisma.collection.update({ where: { id: existing.id }, data: COPY });
  } else {
    // After the last occasion, so the /occasions index keeps its order.
    const last = await prisma.collection.aggregate({ where: { type: "OCCASION" }, _max: { position: true } });
    console.log(`COLLECTION  /occasions/${SLUG} — CREATE`);
    if (WRITE) {
      const created = await prisma.collection.create({
        data: { type: "OCCASION", slug: SLUG, position: (last._max.position ?? 0) + 1, ...COPY },
      });
      collectionId = created.id;
    }
  }

  // 2 · Products
  const products = await prisma.product.findMany({
    where: { slug: { in: PICKS } },
    select: { id: true, slug: true, status: true, shippable: true, name: true, tagline: true, description: true, contents: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  let position = 0;
  let added = 0;
  console.log("\nBASKETS");
  for (const slug of PICKS) {
    const p = bySlug.get(slug);
    if (!p) {
      console.log(`  skip  ${slug} — not found`);
      continue;
    }
    if (p.status !== "ACTIVE") {
      console.log(`  skip  ${slug} — status ${p.status}`);
      continue;
    }
    const hit = flags([p.name, p.tagline, p.description, p.contents].map(textOf).join(" "));
    if (hit.length) {
      console.log(`  skip  ${slug} — mentions: ${hit.join(", ")} (check it, then add by hand if it is fine)`);
      continue;
    }
    console.log(`  add   ${slug}${p.shippable ? "" : "  (local delivery only)"}`);
    added++;
    if (WRITE && collectionId) {
      await prisma.productCollection.upsert({
        where: { productId_collectionId: { productId: p.id, collectionId } },
        create: { productId: p.id, collectionId, position },
        update: { position },
      });
    }
    position++;
  }
  if (!added) console.log("  ! no basket passed — the collection page will be empty and noindexed");

  // 3 · Guide
  const guide = await prisma.article.findUnique({ where: { slug: GUIDE_SLUG }, select: { id: true, body: true } });
  console.log("\nGUIDE");
  if (!guide) {
    console.log(`  ${GUIDE_SLUG} not found — nothing to update`);
  } else {
    const body = { ...(guide.body as { en: string; fr: string }) };
    let changed = false;
    for (const locale of ["en", "fr"] as const) {
      const [from, to] = GUIDE_EDITS[locale];
      if (body[locale]?.includes(from)) {
        body[locale] = sanitizeHtml(body[locale].replace(from, to));
        changed = true;
        console.log(`  ${locale}: closing link -> /occasions/diwali`);
      } else if (body[locale]?.includes(to)) {
        console.log(`  ${locale}: already points at /occasions/diwali`);
      } else {
        console.log(`  ${locale}: closing sentence was edited in the admin — update the link by hand`);
      }
    }
    if (WRITE && changed) await prisma.article.update({ where: { id: guide.id }, data: { body } });
  }

  console.log(
    WRITE
      ? "\nDone. Deploy (push to main) so the menu link and homepage tile go live."
      : "\nNothing written. Re-run with -- --write to apply."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
