/**
 * Rewrite the accented brand spelling to plain "Velvea" in stored content.
 *
 *   npx tsx --env-file=.env scripts/unaccent-brand.ts            # report only
 *   npx tsx --env-file=.env scripts/unaccent-brand.ts --apply    # write
 *
 * Runs against PRODUCTION (.env). The owner dropped the accent on 22 Nov 2026
 * so the site matches the Google Business Profile, Instagram and YouTube, which
 * all say "Velvea". The code and message files were changed in the same pass;
 * this covers the copy that lives in the database.
 *
 * Only catalogue, content and settings tables are touched. Orders are a record
 * of what was sold and are left alone, and so is anything a customer wrote
 * (reviews, enquiries, basket requests): their wording is theirs.
 *
 * Idempotent: a second run finds nothing.
 */
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");

const TABLES = [
  "Product", "ProductVariant", "ProductImage", "Collection",
  "BuilderContainer", "BuilderItemCategory", "BuilderItem",
  "Article", "Setting", "DeliveryZone",
];

// The accent as one character or as "e" + combining acute (U+0301).
const LOWER = "([Vv][Ee][Ll][Vv])(?:é|é)([Aa])";
const UPPER = "([Vv][Ee][Ll][Vv])(?:É|É)([Aa])";
const ANY = "[Vv][Ee][Ll][Vv](é|É|é|É)[Aa]";

async function main() {
  const prisma = new PrismaClient();
  try {
    const cols = await prisma.$queryRawUnsafe<{ table_name: string; column_name: string; udt_name: string }[]>(
      `SELECT table_name, column_name, udt_name FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = ANY($1)
         AND udt_name IN ('text', 'varchar', 'jsonb', 'json', '_text')
       ORDER BY table_name, ordinal_position`,
      TABLES,
    );

    const hits: { table: string; column: string; type: string; rows: number }[] = [];
    for (const c of cols) {
      const [{ n }] = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
        `SELECT count(*) AS n FROM "${c.table_name}" WHERE "${c.column_name}"::text ~ $1`,
        ANY,
      );
      if (Number(n) > 0) {
        hits.push({ table: c.table_name, column: c.column_name, type: c.udt_name, rows: Number(n) });
        console.log(`${c.table_name}.${c.column_name}  ${n} row(s)`);
      }
    }

    console.log(`\n${hits.reduce((a, h) => a + h.rows, 0)} cell(s) across ${hits.length} column(s).`);
    if (!hits.length || !APPLY) {
      if (hits.length) console.log("Report only. Re-run with --apply to write.");
      return;
    }

    await prisma.$transaction(
      hits.map((h) => {
        const cast = h.type === "_text" ? "text[]" : h.type;
        return prisma.$executeRawUnsafe(
          `UPDATE "${h.table}" SET "${h.column}" =
             regexp_replace(regexp_replace("${h.column}"::text, $1, '\\1e\\2', 'g'), $2, '\\1E\\2', 'g')::${cast}
           WHERE "${h.column}"::text ~ $3`,
          LOWER, UPPER, ANY,
        );
      }),
    );
    console.log("Written.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
