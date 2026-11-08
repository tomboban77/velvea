/**
 * Set up the searched-for occasion collections that have written content in
 * src/lib/occasion-seo.ts but no collection row yet: milestone birthdays,
 * proposal and engagement, real estate closing gifts.
 *
 *   npm run occasions:collections            report only — shows what would change
 *   npm run occasions:collections -- --write apply
 *
 * Report-only by default because the local `.env` DATABASE_URL points at the
 * production database (same shape as `diwali:collection`).
 *
 * What it does:
 *   1. Creates each OCCASION collection (or refreshes its name and description
 *      if it exists). seoTitle/seoDescription are left empty on purpose: the
 *      written titles in occasion-seo.ts apply until someone sets one in admin.
 *   2. Links the baskets in PICKS, in that order, skipping any that are not
 *      ACTIVE. Existing links keep their basket; positions are refreshed.
 *   3. Points the closing sentence of the real estate closing gifts guide at
 *      the new collection instead of the housewarming one.
 *
 * Safe to re-run: links are upserted and the guide edit only applies once.
 * The nav entries (src/lib/nav.ts) are already in code; until this runs, each
 * menu link opens an empty, noindex page.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sanitizeHtml } from "../src/lib/sanitize";

const prisma = new PrismaClient();
const WRITE = process.argv.includes("--write");

type Setup = {
  slug: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  picks: string[];
};

const SETUPS: Setup[] = [
  {
    slug: "milestone-birthday",
    name: { en: "Milestone Birthday", fr: "Anniversaire marquant" },
    description: {
      en: "Gift baskets for the big birthdays, 18th to 90th: the larger gourmet hampers, luxury beauty and self-care crates, grooming boxes and grand chocolate and flower baskets, packed by hand in Mississauga and delivered same day across the GTA.",
      fr: "Paniers-cadeaux pour les grands anniversaires, de 18 à 90 ans : grands paniers gourmet, coffrets beauté et bien-être de luxe, coffrets de toilette et grands paniers de chocolat et de fleurs, emballés à la main à Mississauga et livrés le jour même dans le Grand Toronto.",
    },
    // Upper end of the range first; the surprise-party baskets a group gives together.
    picks: [
      "grand-luxe-gourmet-hamper",
      "the-modern-gentleman-box",
      "the-modern-gentleman-gift-crate",
      "petals-glow-luxury-beauty-basket",
      "rose-radiance-self-care-gift-crate",
      "grand-chocolate-bloom-basket",
      "blush-roses-beauty-crate",
      "amber-glow-beauty-basket",
      "the-gourmet-signature-gift-tray",
      "blush-bliss-beauty-gift-box",
      "winter-indulgence-gift-box",
      "birthday-bliss-gourmet-gift-hamper",
      "birthday-celebration-treat-box",
      "grand-bloom-luxury-flower-bouquet",
    ],
  },
  {
    slug: "proposal",
    name: { en: "Proposal & Engagement", fr: "Demande en mariage et fiançailles" },
    description: {
      en: "Gift baskets for the proposal and for the newly engaged couple: roses, chocolate, spa and gourmet hampers packed by hand in Mississauga and delivered same day to homes, hotels and restaurants across the GTA.",
      fr: "Paniers-cadeaux pour la demande en mariage et pour le couple nouvellement fiancé : roses, chocolat, spa et gourmet, emballés à la main à Mississauga et livrés le jour même à domicile, à l'hôtel ou au restaurant dans le Grand Toronto.",
    },
    picks: [
      "love-in-bloom",
      "crimson-ivory-rose-bouquet",
      "grand-bloom-luxury-flower-bouquet",
      "chocolate-rose-garden-crate",
      "grand-chocolate-bloom-basket",
      "rose-glow-luxe-gift-basket",
      "rose-radiance-gift-basket",
      "blush-roses-beauty-crate",
      "petals-glow-luxury-beauty-basket",
      "anniversary-celebration-tray",
      "blush-bloom-self-care-basket",
      "rose-glow-gift-basket",
    ],
  },
  {
    slug: "real-estate-closing",
    name: { en: "Real Estate Closing", fr: "Clôture immobilière" },
    description: {
      en: "Closing gift baskets for real estate agents, mortgage brokers and lawyers: shareable gourmet, coffee and chocolate hampers with no logo in sight, packed by hand in Mississauga and delivered to the new address across the GTA on the day you choose.",
      fr: "Paniers-cadeaux de clôture pour courtiers immobiliers, courtiers hypothécaires et avocats : paniers gourmet, café et chocolat à partager, sans logo, emballés à la main à Mississauga et livrés à la nouvelle adresse dans le Grand Toronto le jour de votre choix.",
    },
    // Shareable and useful in week one; shippable where possible so an agent
    // can send to a client who bought outside the GTA.
    picks: [
      "coffee-comfort-basket",
      "golden-hour-coffee-gourmet-gift-box",
      "canadian-gourmet-delights-gift-basket",
      "the-gourmet-indulgence-gift-hamper",
      "sweet-savoury-snack-hatbox",
      "the-gourmet-signature-gift-tray",
      "signature-corporate-gift-box",
      "corporate-appreciation-gift-box",
      "winter-indulgence-gift-box",
      "chocolate-rose-garden-crate",
      "heartfelt-gourmet-gift-basket",
      "italian-gourmet-celebration-gift-hamper",
      "grand-luxe-gourmet-hamper",
    ],
  },
];

const GUIDE_SLUG = "real-estate-closing-gifts-gta";
const GUIDE_EDITS = {
  en: [
    '<a href="/occasions/housewarming">Housewarming baskets</a> and <a href="/recipients/clients">baskets for clients</a> are the place to start.',
    '<a href="/occasions/real-estate-closing">Real estate closing gift baskets</a> and <a href="/recipients/clients">baskets for clients</a> are the place to start.',
  ],
  fr: [
    'Les <a href="/fr/occasions/housewarming">paniers de crémaillère</a> et les <a href="/fr/recipients/clients">paniers pour clients</a> sont un bon point de départ.',
    'Les <a href="/fr/occasions/real-estate-closing">paniers-cadeaux de clôture immobilière</a> et les <a href="/fr/recipients/clients">paniers pour clients</a> sont un bon point de départ.',
  ],
} as const;

async function setup(s: Setup) {
  console.log(`\n=== /occasions/${s.slug}`);
  const existing = await prisma.collection.findUnique({ where: { slug: s.slug }, select: { id: true, type: true } });
  let collectionId = existing?.id;
  if (existing && existing.type !== "OCCASION") {
    console.log(`  ! slug exists as a ${existing.type} collection — not touching it`);
    return;
  }
  if (existing) {
    console.log("  collection exists — refreshing name and description");
    if (WRITE) await prisma.collection.update({ where: { id: existing.id }, data: { name: s.name, description: s.description } });
  } else {
    const last = await prisma.collection.aggregate({ where: { type: "OCCASION" }, _max: { position: true } });
    console.log("  collection — CREATE");
    if (WRITE) {
      const created = await prisma.collection.create({
        data: { type: "OCCASION", slug: s.slug, position: (last._max.position ?? 0) + 1, name: s.name, description: s.description },
      });
      collectionId = created.id;
    }
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: s.picks } },
    select: { id: true, slug: true, status: true, shippable: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  let position = 0;
  let added = 0;
  for (const slug of s.picks) {
    const p = bySlug.get(slug);
    if (!p) {
      console.log(`  skip  ${slug} — not found`);
      continue;
    }
    if (p.status !== "ACTIVE") {
      console.log(`  skip  ${slug} — status ${p.status}`);
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
  if (!added) console.log("  ! no basket passed — the page would be empty and noindexed");
}

async function guide() {
  console.log("\n=== guide");
  const g = await prisma.article.findUnique({ where: { slug: GUIDE_SLUG }, select: { id: true, body: true } });
  if (!g) {
    console.log(`  ${GUIDE_SLUG} not found — nothing to update`);
    return;
  }
  const body = { ...(g.body as { en: string; fr: string }) };
  let changed = false;
  for (const locale of ["en", "fr"] as const) {
    const [from, to] = GUIDE_EDITS[locale];
    if (body[locale]?.includes(from)) {
      body[locale] = sanitizeHtml(body[locale].replace(from, to));
      changed = true;
      console.log(`  ${locale}: closing link -> /occasions/real-estate-closing`);
    } else if (body[locale]?.includes(to)) {
      console.log(`  ${locale}: already points at /occasions/real-estate-closing`);
    } else {
      console.log(`  ${locale}: closing sentence was edited in the admin — update the link by hand`);
    }
  }
  if (WRITE && changed) await prisma.article.update({ where: { id: g.id }, data: { body } });
}

async function main() {
  console.log(WRITE ? "Applying…" : "Report only — pass -- --write to apply.");
  for (const s of SETUPS) await setup(s);
  await guide();
  console.log(
    WRITE
      ? "\nDone. Admin → Settings → Refresh storefront (or wait for the hourly revalidate), then deploy if the nav change is not live yet."
      : "\nNothing written. Re-run with -- --write to apply."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
