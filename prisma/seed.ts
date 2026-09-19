import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { OCCASIONS, RECIPIENTS, CATEGORIES, HOLIDAYS } from "../src/lib/nav";
import { ZONE_SEED } from "./zones";

const prisma = new PrismaClient();

const L = (en: string, fr?: string) => ({ en, fr: fr || en });

/**
 * Demo products, their reviews and the placeholder gift guides are opt-in.
 * They are invented sample data with no images, so seeding them into a real
 * store just means deleting twelve baskets by hand later. Structure the store
 * genuinely needs — collections, the custom builder, settings, the admin user —
 * is always seeded.
 *
 *   SEED_DEMO_CONTENT=true npm run db:seed
 */
const SEED_DEMO_CONTENT = process.env.SEED_DEMO_CONTENT === "true";

async function main() {
  console.log(`Seeding Velvea${SEED_DEMO_CONTENT ? " (with demo content)" : ""}...`);

  // --- Admin user ---
  // No fallback credentials: a seed that invents a known email/password and
  // prints it to the console is a published set of admin keys.
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !adminPassword) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding.\n" +
        "  e.g. ADMIN_EMAIL=you@velvea.ca ADMIN_PASSWORD='<strong password>' npm run db:seed"
    );
    process.exit(1);
  }
  if (adminPassword.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Velvea Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 11),
      emailVerified: new Date(),
    },
  });
  console.log(`  - Admin: ${adminEmail} (password taken from ADMIN_PASSWORD)`);

  // --- Collections ---
  const mkCollections = async (
    type: "OCCASION" | "RECIPIENT" | "CATEGORY",
    list: { slug: string; en: string; fr: string }[],
    offset = 0
  ) => {
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const position = offset + i;
      await prisma.collection.upsert({
        where: { slug: c.slug },
        update: { name: L(c.en, c.fr), type, position },
        create: {
          slug: c.slug,
          type,
          name: L(c.en, c.fr),
          position,
          featured: offset === 0 && i < 6,
        },
      });
    }
  };
  await mkCollections("OCCASION", OCCASIONS);
  // The seasonal nav (Christmas, Valentine's, Mother's/Father's Day,
  // Thanksgiving) linked to collections that were never seeded, so every one of
  // those pages was empty. They are seeded here, after the everyday occasions so
  // their positions follow on.
  await mkCollections("OCCASION", HOLIDAYS, OCCASIONS.length);
  await mkCollections("RECIPIENT", RECIPIENTS);
  await mkCollections("CATEGORY", CATEGORIES);
  const collections = await prisma.collection.findMany();
  const cid = (slug: string) => collections.find((c) => c.slug === slug)?.id;
  console.log(`  - ${collections.length} collections`);

  // --- Products ---
  type Seed = {
    slug: string;
    name: string;
    fr?: string;
    tagline: string;
    price: number;
    compareAt?: number;
    occasions: string[];
    recipients: string[];
    categories: string[];
    contents: string[];
    featured?: boolean;
    bestseller?: boolean;
    badges?: string[];
  };

  const products: Seed[] = [
    {
      slug: "noel-nights-gourmet",
      name: "Noel Nights Gourmet Basket",
      fr: "Panier gourmand Nuits de Noël",
      tagline: "Chocolate, biscotti and sparkling for the festive table.",
      price: 12900,
      compareAt: 14900,
      occasions: ["holiday", "congratulations"],
      recipients: ["couples", "family"],
      categories: ["gourmet", "chocolate"],
      contents: ["Belgian truffles", "Almond biscotti", "Maple caramel crunch", "Sparkling grape", "Sea-salt crackers"],
      featured: true,
      bestseller: true,
      badges: ["bestseller"],
    },
    {
      slug: "wine-belgian-biscuit",
      name: "Wine & Luxury Belgian Biscuit",
      tagline: "A red wine paired with fine Belgian biscuit cookies.",
      price: 10900,
      occasions: ["birthday", "thank-you", "anniversary"],
      recipients: ["for-him", "for-her", "clients"],
      categories: ["wine-spirits", "chocolate"],
      contents: ["Red wine 750ml", "Belgian biscuit cookies", "Dark chocolate almonds", "Fig spread"],
      featured: true,
      bestseller: true,
    },
    {
      slug: "healing-hugs-sympathy",
      name: "Healing Hugs Sympathy Basket",
      fr: "Panier de sympathie Réconfort",
      tagline: "A gentle, considered gift for a difficult time.",
      price: 9500,
      occasions: ["sympathy", "get-well"],
      recipients: ["a-friend", "family"],
      categories: ["gourmet", "coffee-tea"],
      contents: ["Chamomile tea", "Honey", "Shortbread", "Comfort candle", "Handwritten note"],
      featured: true,
    },
    {
      slug: "little-arrival-baby",
      name: "Little Arrival Baby Basket",
      fr: "Panier Petite arrivée",
      tagline: "Soft essentials to welcome a new baby.",
      price: 11500,
      occasions: ["new-baby"],
      recipients: ["new-parents"],
      categories: ["baby"],
      contents: ["Organic cotton swaddle", "Plush bunny", "Baby booties", "Wooden rattle", "Milestone cards"],
      featured: true,
      badges: ["new"],
    },
    {
      slug: "sweet-celebration-birthday",
      name: "Sweet Celebration Birthday Box",
      tagline: "A little indulgent, exactly as a birthday should be.",
      price: 8900,
      occasions: ["birthday"],
      recipients: ["for-her", "a-friend"],
      categories: ["chocolate", "gourmet"],
      contents: ["Milk & dark chocolate", "Butter pretzels", "Caramel popcorn", "Birthday candle"],
      bestseller: true,
    },
    {
      slug: "the-connoisseur-wine",
      name: "The Connoisseur Wine Duo",
      tagline: "Two curated bottles with charcuterie companions.",
      price: 16500,
      occasions: ["anniversary", "congratulations", "holiday"],
      recipients: ["couples", "clients"],
      categories: ["wine-spirits", "gourmet"],
      contents: ["Red wine", "White wine", "Aged cheddar", "Rosemary crackers", "Olives"],
      featured: true,
    },
    {
      slug: "spa-serenity-wellness",
      name: "Spa Serenity Wellness Basket",
      fr: "Panier bien-être Sérénité",
      tagline: "A calm evening in, gift-wrapped.",
      price: 10500,
      occasions: ["get-well", "thank-you", "birthday"],
      recipients: ["for-her"],
      categories: ["spa-wellness", "coffee-tea"],
      contents: ["Bath soak", "Soy candle", "Herbal tea", "Hand cream", "Eye mask"],
      badges: ["new"],
    },
    {
      slug: "thank-you-gourmet",
      name: "With Gratitude Gourmet Basket",
      fr: "Panier Avec gratitude",
      tagline: "A warm thank-you, beautifully presented.",
      price: 9900,
      occasions: ["thank-you", "housewarming"],
      recipients: ["clients", "a-friend"],
      categories: ["gourmet", "coffee-tea"],
      contents: ["Artisan coffee", "Shortbread", "Preserves", "Chocolate wafer cookies", "Honey"],
      bestseller: true,
    },
    {
      slug: "housewarming-harvest",
      name: "Housewarming Harvest Crate",
      tagline: "Everything for a cozy first night in a new home.",
      price: 13500,
      occasions: ["housewarming", "congratulations"],
      recipients: ["couples", "family"],
      categories: ["gourmet", "wine-spirits"],
      contents: ["Olive oil", "Balsamic", "Pasta", "Truffles", "Sparkling", "Candle"],
    },
    {
      slug: "congrats-celebration",
      name: "Congratulations Celebration Tower",
      tagline: "Stack of treats to mark the big moment.",
      price: 11900,
      occasions: ["congratulations", "birthday"],
      recipients: ["clients", "employees"],
      categories: ["chocolate", "gourmet"],
      contents: ["Chocolate truffles", "Biscotti", "Caramel corn", "Cookies", "Sparkling"],
      badges: ["limited"],
    },
    {
      slug: "fresh-fruit-classic",
      name: "Classic Fresh Fruit Basket",
      fr: "Panier de fruits frais",
      tagline: "Seasonal fruit, hand-selected and arranged.",
      price: 7900,
      occasions: ["get-well", "thank-you"],
      recipients: ["family", "a-friend"],
      categories: ["fresh-fruit"],
      contents: ["Apples", "Pears", "Kiwi", "Oranges", "Grapes"],
    },
    {
      slug: "executive-corporate",
      name: "The Executive Corporate Hamper",
      tagline: "A polished gift that reflects your standard.",
      price: 18900,
      occasions: ["holiday", "thank-you", "congratulations"],
      recipients: ["clients", "employees"],
      categories: ["gourmet", "wine-spirits", "chocolate"],
      contents: ["Champagne", "Assorted cookies", "Chocolate bar", "Brie spread", "Table crackers", "Truffles"],
      featured: true,
      bestseller: true,
      badges: ["bestseller"],
    },
  ];

  for (const p of SEED_DEMO_CONTENT ? products : []) {
    const collectionIds = [
      ...p.occasions.map(cid),
      ...p.recipients.map(cid),
      ...p.categories.map(cid),
    ].filter(Boolean) as string[];

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: L(p.name, p.fr),
        tagline: L(p.tagline),
        description: L(
          `${p.name} is hand-packed to order and arranged to arrive exactly as it appears online. ${p.tagline} Each item is chosen for quality, and the basket is finished with sustainable materials and a handwritten note.`
        ),
        contents: p.contents.map((c) => L(c)),
        priceCents: p.price,
        compareAtCents: p.compareAt ?? null,
        status: "ACTIVE",
        featured: p.featured ?? false,
        bestseller: p.bestseller ?? false,
        badges: p.badges ?? [],
        // Left at zero: avgRating/reviewCount are recomputed from approved
        // reviews, so seeding random values only made them collapse the first
        // time a review was moderated.
        avgRating: 0,
        reviewCount: 0,
        collections: {
          create: collectionIds.map((id, i) => ({ collectionId: id, position: i })),
        },
      },
    });
  }
  console.log(
    SEED_DEMO_CONTENT
      ? `  - ${products.length} demo products`
      : "  - products skipped (set SEED_DEMO_CONTENT=true for sample baskets)"
  );

  // --- Gift card product ---
  // Seeded as a DRAFT: gift cards are paused (see src/lib/features.ts) because
  // nothing issues, emails or redeems a code yet. Kept so the denominations and
  // copy survive until redemption ships.
  await prisma.product.upsert({
    where: { slug: "velvea-gift-card" },
    update: { status: "DRAFT" },
    create: {
      slug: "velvea-gift-card",
      name: L("Velvea Gift Card", "Carte-cadeau Velvea"),
      tagline: L("Let them choose their perfect basket.", "Laissez-les choisir leur panier."),
      description: L(
        "A Velvea digital gift card — delivered by email with a unique code, redeemable on any gift basket. The thoughtful choice when you want them to pick their own.",
        "Une carte-cadeau numérique Velvea, envoyée par courriel avec un code unique, échangeable sur n'importe quel panier."
      ),
      priceCents: 5000,
      status: "DRAFT",
      featured: false,
      badges: [],
      leadTimeDays: 0,
      variants: {
        create: [
          { label: L("$50"), priceCents: 5000, position: 0 },
          { label: L("$100"), priceCents: 10000, position: 1 },
          { label: L("$150"), priceCents: 15000, position: 2 },
          { label: L("$200"), priceCents: 20000, position: 3 },
        ],
      },
    },
  });
  console.log(`  - gift card product (draft — gift cards are paused)`);

  // --- Reviews ---
  const reviewSeeds = [
    { slug: "noel-nights-gourmet", author: "Pia M.", loc: "Montréal, QC", rating: 5, title: "Client holiday basket", body: "My client wrote to say they truly enjoyed the gourmet basket. It looked exactly like the photos and arrived beautifully packed." },
    { slug: "wine-belgian-biscuit", author: "Opeyemi A.", loc: "Beaver Bank, NS", rating: 5, title: "Absolutely perfect gift", body: "From the moment the box opened, the presentation was elegant and every item felt considered. An instant hit." },
    { slug: "healing-hugs-sympathy", author: "Anuja V.", loc: "Toronto, ON", rating: 5, title: "A perfect expression of care", body: "I sent this to a friend mourning a loss. She said it was the kindest, gentlest thing to receive." },
    { slug: "executive-corporate", author: "Daniel R.", loc: "Calgary, AB", rating: 5, title: "Impeccable for clients", body: "Ordered fifteen for year-end client gifts. Every one arrived on time and looked premium." },
    { slug: "sweet-celebration-birthday", author: "Mei L.", loc: "Vancouver, BC", rating: 4, title: "Lovely birthday surprise", body: "Beautifully arranged and delivered same day in the GTA. Would order again." },
  ];
  for (const r of SEED_DEMO_CONTENT ? reviewSeeds : []) {
    const product = await prisma.product.findUnique({ where: { slug: r.slug } });
    if (!product) continue;
    const exists = await prisma.review.findFirst({
      where: { productId: product.id, authorName: r.author },
    });
    if (exists) continue;
    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: r.author,
        authorLocation: r.loc,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: "APPROVED",
        verified: true,
      },
    });
  }
  // Ratings are derived, never seeded: recompute from the approved reviews so
  // the storefront shows the same numbers moderation will produce later.
  const rated = await prisma.review.groupBy({
    by: ["productId"],
    where: { status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  for (const r of rated) {
    await prisma.product.update({
      where: { id: r.productId },
      data: { avgRating: r._avg.rating ?? 0, reviewCount: r._count },
    });
  }
  console.log(SEED_DEMO_CONTENT ? "  - demo reviews" : "  - reviews skipped");

  // --- Custom builder ---
  const containers = [
    { name: "Signature Wooden Crate", price: 2500, cap: 8 },
    { name: "Keepsake Gift Box", price: 1800, cap: 6 },
    { name: "Classic Woven Basket", price: 2200, cap: 8 },
  ];
  for (let i = 0; i < containers.length; i++) {
    const c = containers[i];
    const exists = await prisma.builderContainer.findFirst({ where: { name: { path: ["en"], equals: c.name } } as never });
    if (!exists) {
      await prisma.builderContainer.create({
        data: { name: L(c.name), priceCents: c.price, capacity: c.cap, position: i, active: true },
      });
    }
  }
  const builderCats: { name: string; items: { n: string; p: number }[] }[] = [
    { name: "Chocolate & Sweets", items: [{ n: "Belgian truffles", p: 1400 }, { n: "Sea-salt caramels", p: 1200 }, { n: "Maple crunch", p: 1000 }, { n: "Dark chocolate bar", p: 800 }] },
    { name: "Savoury", items: [{ n: "Aged cheddar", p: 1300 }, { n: "Rosemary crackers", p: 700 }, { n: "Marinated olives", p: 900 }, { n: "Fig spread", p: 850 }] },
    { name: "Sip", items: [{ n: "Red wine", p: 2600 }, { n: "Sparkling grape", p: 1500 }, { n: "Artisan coffee", p: 1600 }, { n: "Herbal tea", p: 1100 }] },
    { name: "Little Extras", items: [{ n: "Soy candle", p: 1800 }, { n: "Handwritten card", p: 500 }, { n: "Fresh flowers", p: 2200 }] },
  ];
  for (let i = 0; i < builderCats.length; i++) {
    const bc = builderCats[i];
    let cat = await prisma.builderItemCategory.findFirst({ where: { name: { path: ["en"], equals: bc.name } } as never });
    if (!cat) cat = await prisma.builderItemCategory.create({ data: { name: L(bc.name), position: i } });
    for (let j = 0; j < bc.items.length; j++) {
      const it = bc.items[j];
      const exists = await prisma.builderItem.findFirst({
        where: { categoryId: cat.id, name: { path: ["en"], equals: it.n } } as never,
      });
      if (!exists) {
        await prisma.builderItem.create({
          data: { categoryId: cat.id, name: L(it.n), priceCents: it.p, position: j, active: true },
        });
      }
    }
  }
  console.log(`  - custom builder`);

  // --- Articles ---
  const articles = [
    { slug: "corporate-gifting-guide", cat: "CORPORATE", title: "The Complete Guide to Corporate Gifting in Canada", excerpt: "How to choose client and employee gifts that feel personal, professional and on-brand." },
    { slug: "sympathy-gift-etiquette", cat: "SYMPATHY", title: "Sympathy Gift Etiquette: What to Send and Say", excerpt: "Thoughtful guidance for choosing a gift that offers genuine comfort." },
    { slug: "gifts-by-occasion", cat: "OCCASIONS", title: "Gift Ideas by Occasion: A Year of Thoughtful Gifting", excerpt: "From birthdays to housewarmings, matched to the moment." },
  ];
  for (const a of SEED_DEMO_CONTENT ? articles : []) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        slug: a.slug,
        category: a.cat as never,
        title: L(a.title),
        excerpt: L(a.excerpt),
        body: L(
          `<p>${a.excerpt}</p><p>At Velvea, every basket is hand-packed to order and arranged to arrive exactly as it appears online. This guide walks through the details that make a gift feel considered — from choosing the right tone for the moment to adding a handwritten note.</p><h2>Getting the tone right</h2><p>The right gift never depends on price; it depends on the moment. A birthday calls for something indulgent, while a sympathy gift should feel gentle and considered.</p>`
        ),
        author: "The Velvea Team",
        readMinutes: 4,
        status: "PUBLISHED",
        featured: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log(SEED_DEMO_CONTENT ? "  - demo articles" : "  - articles skipped");

  // --- Discount ---
  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENT", value: 10, minSubtotalCents: 5000, active: true },
  });
  console.log(`  - discount WELCOME10`);

  // --- Delivery zones ---
  // Upserted by key so re-seeding never overwrites a rate that has been tuned
  // in the admin; only genuinely new zones are inserted.
  let zonesAdded = 0;
  for (const zone of ZONE_SEED) {
    const exists = await prisma.deliveryZone.findUnique({ where: { key: zone.key } });
    if (exists) continue;
    await prisma.deliveryZone.create({ data: zone });
    zonesAdded++;
  }
  const pendingReview = ZONE_SEED.filter((z) => z.active === false).length;
  console.log(`  - delivery zones (${zonesAdded} added)`);
  if (zonesAdded > 0 && pendingReview > 0) {
    console.log(`    ${pendingReview} zone(s) are seeded INACTIVE pending postal-code review.`);
    console.log("    Verify their FSA prefixes against canadapost.ca, then activate");
    console.log("    them in Admin -> Delivery zones. Until then those addresses fall");
    console.log("    through to Ontario ground shipping, which is priced to cover them.");
  }

  // --- Settings ---
  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: { key: "site", value: {} as Prisma.InputJsonValue },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
