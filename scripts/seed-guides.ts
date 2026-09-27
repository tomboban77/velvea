/**
 * Load the written guides into the articles table.
 *
 *   npm run seed:guides                        report only — shows what would change
 *   npm run seed:guides -- --write             apply, as DRAFT
 *   npm run seed:guides -- --write --publish   apply and put them live
 *   npm run seed:guides -- --write --force     also overwrite PUBLISHED guides
 *
 * Report-only by default, because the local `.env` DATABASE_URL points at the
 * production database and a guide seeder is not worth a surprise. Same shape as
 * `audit:alcohol`: look first, then decide.
 *
 * Everything lands as DRAFT. Nothing appears on the storefront until someone
 * opens Admin -> Articles and publishes it, which is the review step — these
 * were written from the catalogue and the policy pages, and an owner should
 * read them before customers do.
 *
 * A guide that is already PUBLISHED is skipped unless --force, so re-running
 * this after an editor has revised a live article cannot silently revert it.
 */
import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import { sanitizeHtml } from "../src/lib/sanitize";
import { GUIDES } from "./guides";

const prisma = new PrismaClient();
const WRITE = process.argv.includes("--write");
const FORCE = process.argv.includes("--force");
const PUBLISH = process.argv.includes("--publish");

const AUTHOR = "Velvéa";

/** Internal /guides/... links must resolve, or a published guide ships a 404. */
function checkCrossLinks(): string[] {
  const slugs = new Set(GUIDES.map((g) => g.slug));
  const problems: string[] = [];
  for (const guide of GUIDES) {
    for (const [locale, body] of Object.entries(guide.body)) {
      const links = body.match(/href="(?:\/fr)?\/guides\/([^"]+)"/g) ?? [];
      for (const link of links) {
        const slug = link.replace(/.*\/guides\//, "").replace(/"$/, "");
        if (!slugs.has(slug)) {
          problems.push(`${guide.slug} (${locale}) links to /guides/${slug}, which does not exist`);
        }
      }
    }
  }
  return problems;
}

/**
 * The body is sanitised here rather than trusted, for the same reason the admin
 * sanitises on save: whatever reaches the column is rendered with
 * `dangerouslySetInnerHTML`. If sanitising changes the text, the guide used a
 * tag the allow-list drops and the author should know.
 */
function sanitiseBody(guide: (typeof GUIDES)[number]): { body: { en: string; fr: string }; stripped: string[] } {
  const stripped: string[] = [];
  const en = sanitizeHtml(guide.body.en);
  const fr = sanitizeHtml(guide.body.fr);
  if (en !== guide.body.en) stripped.push(`${guide.slug} (en)`);
  if (fr !== guide.body.fr) stripped.push(`${guide.slug} (fr)`);
  return { body: { en, fr }, stripped };
}

async function main() {
  const linkProblems = checkCrossLinks();
  if (linkProblems.length) {
    console.error("Broken internal guide links:");
    for (const p of linkProblems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }

  console.log(WRITE ? "Writing guides…\n" : "Report only — pass --write to apply.\n");

  for (const guide of GUIDES) {
    const existing = await prisma.article.findUnique({
      where: { slug: guide.slug },
      select: { id: true, status: true },
    });

    if (existing?.status === "PUBLISHED" && !FORCE) {
      console.log(`SKIP    ${guide.slug} — already published (use --force to overwrite)`);
      continue;
    }

    const { body, stripped } = sanitiseBody(guide);
    for (const s of stripped) {
      // Usually harmless normalisation (`<hr>` becomes `<hr />`); occasionally a
      // dropped tag. Either way the stored body differs from the source, so say so.
      console.warn(`  ! sanitiser rewrote ${s} — compare the stored body against the source`);
    }

    const data = {
      category: guide.category,
      title: guide.title as Prisma.InputJsonValue,
      excerpt: guide.excerpt as Prisma.InputJsonValue,
      body: body as Prisma.InputJsonValue,
      seoTitle: guide.seoTitle as Prisma.InputJsonValue,
      seoDescription: guide.seoDescription as Prisma.InputJsonValue,
      readMinutes: guide.readMinutes,
      featured: guide.featured,
      author: AUTHOR,
    };

    const verb = existing ? "UPDATE" : "CREATE";
    const words = body.en.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    console.log(`${verb}  ${guide.slug}  (${guide.category}, ~${words} words en)`);

    if (!WRITE) continue;

    await prisma.article.upsert({
      where: { slug: guide.slug },
      // Status is only set on create: an article an editor has already moved to
      // PUBLISHED (with --force) should keep its status and its publishedAt.
      create: {
        slug: guide.slug,
        status: PUBLISH ? "PUBLISHED" : "DRAFT",
        // Only stamped on create. Re-running must not reset the date a guide
        // first went live: that is what the Article JSON-LD publishes as
        // datePublished and what readers see under the headline.
        publishedAt: PUBLISH ? new Date() : null,
        ...data,
      },
      update: data,
    });
  }

  console.log(
    WRITE
      ? PUBLISH
        ? "\nDone. Guides are PUBLISHED and live on the storefront."
        : "\nDone. All guides are DRAFT — review and publish each one in Admin -> Articles."
      : "\nNothing written. Re-run with -- --write to apply."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
