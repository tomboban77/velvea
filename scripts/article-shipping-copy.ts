/**
 * Find (and with --apply, fix) published articles that quote shipping facts
 * which have changed: Quebec opened on 15 Nov 2026, and Ontario courier
 * shipping went from $28.99 to $31.99 that day, then to $37.99 on 26 Nov 2026
 * (fees now follow the 3rd cheapest carrier quote, see prisma/zones.ts).
 *
 *   npx tsx --env-file=.env scripts/article-shipping-copy.ts            # report
 *   npx tsx --env-file=.env scripts/article-shipping-copy.ts --apply    # write
 *
 * Runs against PRODUCTION (.env). It only ever replaces the exact sentences
 * listed below inside Article.body / excerpt / seoDescription; an article
 * edited in the admin so that a sentence no longer matches is reported and
 * left alone.
 */
import { PrismaClient, type Prisma } from "@prisma/client";

const APPLY = process.argv.includes("--apply");

const REPLACEMENTS: [string, string][] = [
  // 26 Nov 2026 repricing. Short on purpose: the price is the only fact that
  // moved, so the match should not depend on the sentence around it.
  ["Shipping starts at $31.99 within Ontario", "Shipping starts at $37.99 within Ontario"],
  ["L'expédition commence à 31,99 $ en Ontario", "L'expédition commence à 37,99 $ en Ontario"],
  ["usually in two to four business days, from $31.99.", "usually in two to four business days, from $37.99."],
  ["en deux à quatre jours ouvrables, à partir de 31,99 $.", "en deux à quatre jours ouvrables, à partir de 37,99 $."],
  [
    "the Atlantic provinces, the Prairies and British Columbia, with Quebec coming soon. Shipping starts at $28.99 within Ontario",
    "Quebec, the Atlantic provinces, the Prairies and British Columbia. Shipping starts at $31.99 within Ontario",
  ],
  [
    "les provinces de l'Atlantique, les Prairies et la Colombie-Britannique, et le Québec arrive bientôt. L'expédition commence à 28,99 $ en Ontario",
    "le Québec, les provinces de l'Atlantique, les Prairies et la Colombie-Britannique. L'expédition commence à 31,99 $ en Ontario",
  ],
  ["Over the coming months we will open shipping to Quebec, add more local makers,", "Over the coming months we will add more local makers,"],
  [
    "Dans les prochains mois, nous ouvrirons l'expédition vers le Québec, ajouterons d'autres artisans d'ici et continuerons",
    "Dans les prochains mois, nous ajouterons d'autres artisans d'ici et continuerons",
  ],
];

/** Anything that still smells of the old facts after the replacements. */
const STALE = /coming soon|arrive bientôt|(?:28|31|34|36|39|41|42|44|45|53)[.,]99/g;

function rewrite(value: unknown): { next: unknown; hits: number } {
  let hits = 0;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") {
      let s = v;
      for (const [a, b] of REPLACEMENTS) {
        if (s.includes(a)) {
          hits += s.split(a).length - 1;
          s = s.split(a).join(b);
        }
      }
      return s;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return { next: walk(value), hits };
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const articles = await prisma.article.findMany({
      select: { id: true, slug: true, status: true, body: true, excerpt: true, seoDescription: true },
    });
    let pending = 0;
    for (const a of articles) {
      const body = rewrite(a.body);
      const excerpt = rewrite(a.excerpt);
      const seo = rewrite(a.seoDescription);
      const hits = body.hits + excerpt.hits + seo.hits;
      const after = JSON.stringify([body.next, excerpt.next, seo.next]);
      const left = [...after.matchAll(STALE)].map((m) => after.slice(Math.max(0, m.index - 90), m.index + 110));
      if (!hits && !left.length) continue;
      console.log(`\n${a.slug} (${a.status}): ${hits} sentence(s) to replace`);
      for (const ctx of left) console.log(`   still mentions: …${ctx.replace(/\s+/g, " ")}…`);
      if (hits) {
        pending++;
        if (APPLY) {
          await prisma.article.update({
            where: { id: a.id },
            data: {
              body: body.next as Prisma.InputJsonValue,
              ...(a.excerpt ? { excerpt: excerpt.next as Prisma.InputJsonValue } : {}),
              ...(a.seoDescription ? { seoDescription: seo.next as Prisma.InputJsonValue } : {}),
            },
          });
        }
      }
    }
    console.log(APPLY ? `\nUpdated ${pending} article(s).` : `\nReport only: ${pending} article(s) would change.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
