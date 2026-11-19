/**
 * Publish customer reviews the owner collected outside the site (list supplied
 * 18 Nov 2026) as APPROVED reviews on their products.
 *
 *   npx tsx --env-file=.env scripts/import-reviews.ts            # report only
 *   npx tsx --env-file=.env scripts/import-reviews.ts --apply    # write
 *
 * Runs against PRODUCTION (.env). It only inserts Review rows and refreshes
 * Product.avgRating / reviewCount the same way the admin moderation action
 * does (recomputeProductRating in src/lib/actions/admin.ts).
 *
 * - The text is the customer's own wording, untouched.
 * - A rating with no comment is stored with an empty body; it counts toward
 *   the product's average and count, and the storefront queries
 *   (src/lib/queries.ts) leave it out of the listed reviews.
 * - `verified` stays false: none of these is tied to an order row on the site,
 *   and the badge means exactly that.
 * - Idempotent: a review with the same product, author and body is skipped,
 *   so later lists can be appended to REVIEWS and the script re-run.
 * - A product name that does not match exactly one product stops the run
 *   before anything is written.
 */
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");

/** `date` (YYYY-MM-DD) is the day the customer left the review; without it the row keeps its insert time. */
type Row = { product: string; author: string; rating: number; body: string; date?: string };

/** 17:00 UTC is midday in Toronto in both EDT and EST, so the calendar day never slips. */
const toDate = (d: string) => new Date(`${d}T17:00:00Z`);

const REVIEWS: Row[] = [
  {
    product: "Christmas Rose Gourmet Gift Basket",
    author: "Alex Vincent",
    rating: 5, date: "2026-11-17",
    body: "Really happy with the gift hamper from velvea. Everything looked beautiful and the packaging was lovely. Would definitely recommend.",
  },
  { product: "Christmas Rose Gourmet Gift Basket", author: "Subin Panicker", rating: 5, date: "2026-11-17", body: "" },
  {
    product: "Canadian Gourmet Delights Gift Basket",
    author: "Rohan T George",
    rating: 5, date: "2026-11-11",
    body: "Everything went smoothly, and the service and hamper was really good. Very happy with the experience.",
  },
  {
    product: "Crimson & Ivory Rose Bouquet",
    author: "Malavika Madhu",
    rating: 5, date: "2026-11-04",
    body: "Ordered the Crimson & Ivory Rose Bouquet from Velvea and it was absolutely beautiful! The roses were fresh, the colours looked lovely together, and the arrangement was just perfect. Really happy with the purchase and would definitely order again!",
  },
  {
    product: "Rosé Radiance Gift Basket",
    author: "Nancy Ortiz",
    rating: 5, date: "2026-11-14",
    body: "Absolutely beautiful! The basket was thoughtfully put together, with great attention to detail and lovely presentation. Everything was wonderful, and the overall experience exceeded my expectations. You can truly tell how much care goes into every detail. Highly recommend Velvea! 🩷",
  },
  {
    product: "Heartfelt Gourmet Gift Basket",
    author: "Vera Williams",
    rating: 5, date: "2026-11-11",
    body: "The package was satisfactory. Delivery was on time. Staff was courteous. I recommend Velvea anytime",
  },
  {
    product: "Heartfelt Gourmet Gift Basket",
    author: "Zach",
    rating: 5, date: "2026-11-12",
    body: "Had a custom hamper made by Velvea, and it turned out better than expected! Beautifully arranged, exactly how I wanted it, and great customer service throughout. Really happy with the experience!",
  },
  { product: "Lavender Beauty Bloom Bouquet", author: "Emma Lecour", rating: 5, date: "2026-10-28", body: "" },
  { product: "Love You Always Gift Hamper", author: "ADARSH REDDY", rating: 5, date: "2026-11-04", body: "" },
  {
    product: "Golden Hour Coffee & Gourmet Gift Box",
    author: "angela binny",
    rating: 5, date: "2026-11-11",
    body: "Ordered the Golden Hour Coffee & Gourmet Gift Box for someone very special to me, and they absolutely loved it! Everything was beautifully packed, delivery was right on time, and the customer service was excellent. Really happy with the experience. Would definitely order again!",
  },
  // The list named this product "Thanksgiving Harvest Gourmet Basket", which
  // matches nothing. The owner confirmed (18 Nov 2026) it belongs on the
  // Thanksgiving Gratitude Basket. The customer's text still uses the old name.
  {
    product: "Thanksgiving Gratitude Basket",
    author: "Rony Boban",
    rating: 5, date: "2026-11-11",
    body: "Loved the Thanksgiving Harvest Gourmet Basket from Velvea! The basket was nicely arranged with a good selection of treats. Great service and everything arrived on time. Would definitely recommend!",
  },
  {
    product: "Love in Bloom",
    author: "Rosmi Srampickal",
    rating: 5, date: "2026-11-11",
    body: "Ordered the \"Love in Bloom\" hamper for our anniversary, and it was absolutely beautiful! The fresh flowers, chocolates and beauty products were perfectly arranged. My husband loved it! Delivery was on time, and the whole experience was great. Thank you, Velvea!",
  },
  {
    product: "Birthday Chocolate Bloom Box",
    author: "Steffy Johnson",
    rating: 5, date: "2026-11-04",
    body: "Ordered the Birthday Chocolate Bloom Box from Velvea, and it was absolutely beautiful! The chocolates were nicely arranged, the packaging was lovely, and it made such a special birthday gift. Really happy with it!",
  },
  {
    product: "Birthday Chocolate Bloom Box",
    author: "Dershan Varghese",
    rating: 5, date: "2026-10-28",
    body: "Bought the Birthday Chocolate Bloom Box from Velvea as a birthday gift, and absolutely loved it! The packaging was beautiful, everything was arranged so nicely, and it made the gift feel extra special. Really happy with my purchase. Would definitely recommend Velvea for gifting!",
  },
  {
    product: "Rose & Radiance Self-Care Gift Crate",
    author: "PRACHI PAL",
    rating: 5, date: "2026-11-04",
    body: "Got the rose and radiance self care gift crate for my friend’s birthday. She absolutely loved it. Highly recommended!!",
  },
  {
    product: "Rose & Radiance Self-Care Gift Crate",
    author: "Vahid Reza Niazmand",
    rating: 5, date: "2026-11-04",
    body: "Bought the Rose & Radiance Self-Care Gift Crate for my girlfriend, and she absolutely loved it! Everything was beautifully packed, and it made such a lovely gift. Really happy with the purchase!",
  },
  {
    product: "Rose and Glow Gift Basket",
    author: "Kevin Ho",
    rating: 5, date: "2026-11-04",
    body: "Got the Rose and Glow gift basket for my wife and she absolutely loved it. Definitely worth it!",
  },

  // Second list, supplied 18 Nov 2026. The owner confirmed these are real
  // customers; several ordered more than one product.
  { product: "Christmas Rose Gourmet Gift Basket", author: "Jeslin Chacko", rating: 5, date: "2026-09-01", body: "Such a beautiful basket. Loved the presentation!" },
  { product: "Canadian Gourmet Delights Gift Basket", author: "Justin Spudic", rating: 5, date: "2026-09-03", body: "Nice selection of treats and lovely packaging." },
  { product: "Crimson & Ivory Rose Bouquet", author: "Ayush Dev", rating: 5, date: "2026-09-05", body: "The roses looked gorgeous. Really nice arrangement." },
  { product: "Rosé Radiance Gift Basket", author: "Michael Shaji", rating: 5, date: "2026-09-07", body: "Beautiful gift basket. Everything looked so pretty." },
  { product: "Heartfelt Gourmet Gift Basket", author: "Michael John", rating: 5, date: "2026-09-11", body: "Great variety of items. Very nicely packed." },
  { product: "Lavender Beauty Bloom Bouquet", author: "Michelle", rating: 5, date: "2026-09-12", body: "Loved the colours and the overall presentation!" },
  { product: "Love You Always Gift Hamper", author: "Amit Sharma", rating: 5, date: "2026-09-16", body: "Such a cute hamper. Really well put together." },
  { product: "Golden Hour Coffee & Gourmet Gift Box", author: "Jeslin Chacko", rating: 5, date: "2026-09-21", body: "Lovely combination of coffee and treats." },
  // Listed as "Thanksgiving Harvest Gourmet Basket": same mapping as above.
  { product: "Thanksgiving Gratitude Basket", author: "Justin Spudic", rating: 5, date: "2026-09-23", body: "Great hamper with a really nice selection." },
  { product: "Love in Bloom", author: "Ayush Dev", rating: 5, date: "2026-09-26", body: "Beautiful flowers and chocolates. Loved it!" },
  { product: "Birthday Chocolate Bloom Box", author: "Michael Shaji", rating: 5, date: "2026-10-02", body: "The chocolate arrangement looked fantastic." },
  { product: "Rose & Radiance Self-Care Gift Crate", author: "Michael John", rating: 5, date: "2026-10-10", body: "Such a thoughtful gift idea. Beautiful packaging." },
  { product: "Rose and Glow Gift Basket", author: "Michelle", rating: 5, date: "2026-10-14", body: "Absolutely lovely basket. Very elegant." },
  { product: "Canadian Gourmet Delights Gift Basket", author: "Amit Sharma", rating: 5, date: "2026-10-19", body: "Really nice assortment of goodies." },
  { product: "Birthday Chocolate Bloom Box", author: "Jeslin Chacko", rating: 5, date: "2026-11-01", body: "Simple, beautiful and perfect for gifting." },
  { product: "Heartfelt Gourmet Gift Basket", author: "Justin Spudic", rating: 5, date: "2026-11-05", body: "Beautifully arranged. Really liked the selection." },
  { product: "Christmas Rose Gourmet Gift Basket", author: "Ayush Dev", rating: 5, date: "2026-11-16", body: "Lovely Christmas gift idea. Looks amazing!" },

  // Third list, supplied 18 Nov 2026.
  { product: "Festive Holiday Gourmet Gift Box", author: "Emma Jacob", rating: 5, date: "2026-10-10", body: "Such a lovely holiday gift box! Beautifully packed with a really nice selection of treats." },
  { product: "The Gourmet Signature Gift Tray", author: "Rohan George", rating: 4, date: "2026-10-12", body: "Nice presentation and a good variety of goodies. Overall, a really nice gift." },
  { product: "Festive Holiday Gourmet Gift Box", author: "Rony Boban", rating: 4, date: "2026-10-13", body: "Really liked the festive packaging and selection. Everything looked neat and well put together." },
  { product: "The Gourmet Signature Gift Tray", author: "Karthika KG", rating: 4, date: "2026-09-17", body: "Loved how nicely everything was arranged. The tray looked elegant and made a lovely gift." },
  { product: "Christmas Gourmet Treasures Gift Box", author: "Subin Panicker", rating: 4, date: "2026-09-04", body: "A nice Christmas gift with a good mix of treats. Packaging was lovely too." },
  { product: "Love You Always Gift Hamper", author: "Tojo Zacharia", rating: 4, date: "2026-09-29", body: "Beautiful little hamper with a thoughtful selection of items. Really liked the overall presentation." },

  // Fourth list, supplied 18 Nov 2026 without product names; the owner picked the products.
  { product: "Love You Always Gift Hamper", author: "Jimiya", rating: 5, date: "2026-11-17", body: "Such a beautiful gift hamper! Loved the teddy bear, chocolates, and the little details that made it special. Everything was arranged so nicely, and the packaging looked lovely. A really sweet gift, and I'm very happy with it!" },
  { product: "Welcome Little Princess Baby Gift Box", author: "Chikku", rating: 5, date: "2026-11-01", body: "A lovely baby gift box. The little outfits are adorable, and I really liked the selection of baby essentials. Everything was arranged beautifully with such pretty packaging." },
];

/** Case, accents, "&" vs "and" and punctuation should not block a match. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, name: true, status: true, avgRating: true, reviewCount: true },
    });
    const byName = new Map<string, typeof products>();
    for (const p of products) {
      const en = (p.name as { en?: string } | null)?.en ?? "";
      const key = norm(en);
      byName.set(key, [...(byName.get(key) ?? []), p]);
    }

    const plan: { row: Row; productId: string; slug: string; exists: boolean; redateId: string | null }[] = [];
    const problems: string[] = [];
    for (const row of REVIEWS) {
      const hits = byName.get(norm(row.product)) ?? [];
      if (hits.length !== 1) {
        const near = products
          .map((p) => (p.name as { en?: string } | null)?.en ?? "")
          .filter((n) => norm(n).split(" ").filter((w) => norm(row.product).split(" ").includes(w)).length >= 2);
        problems.push(`"${row.product}" matched ${hits.length} products. Similar: ${near.join(" | ") || "none"}`);
        continue;
      }
      const p = hits[0];
      const existing = await prisma.review.findFirst({
        where: { productId: p.id, authorName: row.author, body: row.body },
        select: { id: true, createdAt: true },
      });
      // A date added to the list after the row was imported is applied to the existing row.
      const redateId =
        existing && row.date && existing.createdAt.getTime() !== toDate(row.date).getTime() ? existing.id : null;
      plan.push({ row, productId: p.id, slug: p.slug, exists: !!existing, redateId });
      console.log(
        `${redateId ? `REDATE ${row.date}` : existing ? "SKIP (exists)" : "ADD "}${p.slug} [${p.status}, now ${p.reviewCount} reviews]  ${row.author}  ${row.rating}/5  ${row.body ? `${row.body.length} chars` : "rating only"}`,
      );
    }

    if (problems.length) {
      console.log("\nUnmatched product names, nothing written:");
      for (const m of problems) console.log("  " + m);
      process.exitCode = 1;
      return;
    }

    const todo = plan.filter((x) => !x.exists);
    const redate = plan.filter((x) => x.redateId);
    console.log(`\n${todo.length} to add, ${redate.length} to re-date, ${plan.length - todo.length} already present.`);
    if (!APPLY) {
      console.log("Report only. Re-run with --apply to write.");
      return;
    }

    const touched = [...new Set(todo.map((x) => x.productId))];
    await prisma.$transaction(async (tx) => {
      for (const x of todo) {
        await tx.review.create({
          data: {
            productId: x.productId,
            authorName: x.row.author,
            rating: x.row.rating,
            body: x.row.body,
            status: "APPROVED",
            verified: false,
            ...(x.row.date ? { createdAt: toDate(x.row.date) } : {}),
          },
        });
      }
      for (const x of redate) {
        await tx.review.update({ where: { id: x.redateId! }, data: { createdAt: toDate(x.row.date!) } });
      }
      for (const productId of touched) {
        const agg = await tx.review.aggregate({
          where: { productId, status: "APPROVED" },
          _avg: { rating: true },
          _count: true,
        });
        await tx.product.update({
          where: { id: productId },
          data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
        });
      }
    });
    console.log(`Wrote ${todo.length} reviews across ${touched.length} products, re-dated ${redate.length}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
