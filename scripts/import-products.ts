/**
 * Bulk product importer.
 *
 * 1. Put your product photos in:   import/images/
 * 2. Fill your products in:         import/products.json   (see import/products.example.json)
 * 3. Run:                           npm run import:products
 *
 * Images are uploaded to Cloudinary; products are created by slug.
 *
 * A product that already exists is SKIPPED. Once a basket is live it is edited
 * in /admin/products, and the import files go stale: re-running an old file
 * used to replace the whole row, which silently undid admin work (lead times,
 * contents, descriptions) and deleted the product's photos from Cloudinary.
 *
 *   npm run import:products -- --overwrite
 *
 * updates existing products on purpose, and even then only the fields the file
 * actually sets. Anything left out (lead time, contents, images, variants,
 * collections...) keeps its live value.
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { containsFlowers } from "../src/lib/flowers";

const prisma = new PrismaClient();
const OVERWRITE = process.argv.includes("--overwrite");
const IMAGES_DIR = resolve(process.cwd(), "import/images");
const DATA_FILE = resolve(process.cwd(), "import/products.json");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type Loc = string | { en?: string; fr?: string };
type InputProduct = {
  slug?: string;
  name: Loc;
  tagline?: Loc;
  description?: Loc;
  care?: Loc;
  contents?: Loc[];
  price?: number; // dollars
  priceCents?: number; // or cents
  compareAt?: number; // dollars
  compareAtCents?: number;
  sku?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured?: boolean;
  bestseller?: boolean;
  badges?: string[];
  leadTimeDays?: number;
  shippable?: boolean; // false = local delivery/pickup only (fresh, chilled)
  inventory?: number | null;
  occasions?: string[];
  recipients?: string[];
  categories?: string[];
  images?: string[]; // filenames inside import/images/
  variants?: { label: Loc; price?: number; priceCents?: number }[];
  seoTitle?: Loc;
  seoDescription?: Loc;
};

function L(v?: Loc): { en: string; fr: string } | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v.trim() ? { en: v, fr: v } : undefined;
  const en = v.en ?? "";
  const fr = v.fr && v.fr.trim() ? v.fr : en;
  return en || fr ? { en, fr } : undefined;
}

function toSlug(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function cents(dollars?: number, asCents?: number): number | undefined {
  if (typeof asCents === "number") return Math.round(asCents);
  if (typeof dollars === "number") return Math.round(dollars * 100);
  return undefined;
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Cloudinary is not configured in .env. Aborting.");
    process.exit(1);
  }
  if (!existsSync(DATA_FILE)) {
    console.error(`Missing ${DATA_FILE}. Copy import/products.example.json to import/products.json and fill it in.`);
    process.exit(1);
  }

  const products = JSON.parse(readFileSync(DATA_FILE, "utf8")) as InputProduct[];
  if (!Array.isArray(products)) {
    console.error("products.json must be a JSON array of products.");
    process.exit(1);
  }

  // Build collection lookup by slug and by lowercased English name.
  const collections = await prisma.collection.findMany();
  const bySlug = new Map(collections.map((c) => [c.slug, c.id]));
  const byName = new Map(
    collections.map((c) => [String((c.name as { en?: string }).en ?? "").toLowerCase(), c.id])
  );
  const resolveCollections = (arr?: string[]) =>
    (arr ?? [])
      .map((x) => bySlug.get(toSlug(x)) ?? bySlug.get(x) ?? byName.get(x.toLowerCase()))
      .filter(Boolean) as string[];

  let ok = 0;
  const warnings: string[] = [];

  for (const [i, p] of products.entries()) {
    const nameL = L(p.name);
    if (!nameL?.en) {
      warnings.push(`#${i + 1}: skipped, missing name.`);
      continue;
    }
    const priceCents = cents(p.price, p.priceCents);
    if (!priceCents || priceCents <= 0) {
      warnings.push(`"${nameL.en}": skipped, missing/invalid price.`);
      continue;
    }
    const slug = toSlug(p.slug || nameL.en);

    // Decided before any upload, so a skipped product leaves no orphan images.
    const existing = await prisma.product.findUnique({
      where: { slug },
      include: { images: true },
    });
    if (existing && !OVERWRITE) {
      warnings.push(`"${nameL.en}": skipped, already exists. Edit it in /admin/products, or re-run with --overwrite.`);
      continue;
    }

    // Upload images to Cloudinary
    const uploaded: { url: string; publicId: string; width: number; height: number }[] = [];
    for (const file of p.images ?? []) {
      const path = join(IMAGES_DIR, file);
      if (!existsSync(path)) {
        warnings.push(`"${nameL.en}": image not found: ${file}`);
        continue;
      }
      try {
        const res = await cloudinary.uploader.upload(path, {
          folder: "velvea/products",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        uploaded.push({ url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height });
        process.stdout.write(`  uploaded ${file}\n`);
      } catch (e) {
        warnings.push(`"${nameL.en}": upload failed for ${file}: ${(e as Error).message}`);
      }
    }

    const collectionIds = [
      ...resolveCollections(p.occasions),
      ...resolveCollections(p.recipients),
      ...resolveCollections(p.categories),
    ];

    const data = {
      name: nameL,
      tagline: L(p.tagline) ?? {},
      description: L(p.description) ?? {},
      care: L(p.care) ?? {},
      contents: (p.contents ?? []).map(L).filter(Boolean) as object[],
      priceCents,
      compareAtCents: cents(p.compareAt, p.compareAtCents) ?? null,
      sku: p.sku || null,
      status: p.status ?? "ACTIVE",
      featured: p.featured ?? false,
      bestseller: p.bestseller ?? false,
      badges: p.badges ?? [],
      // Flowers are bought in for each order and need two days (owner rule,
      // 3 Nov 2026); everything else is the standard one.
      leadTimeDays:
        p.leadTimeDays ??
        (containsFlowers(
          (p.contents ?? []).map((c) => L(c)?.en ?? ""),
          // BOUQUET_COLLECTION_SLUG; delivery-schedule.ts is server-only and
          // cannot be imported from a plain script.
          (p.categories ?? []).some((c) => toSlug(c) === "flowers")
        )
          ? 2
          : 1),
      shippable: p.shippable ?? true,
      inventory: p.inventory ?? null,
      seoTitle: L(p.seoTitle) ?? {},
      seoDescription: L(p.seoDescription) ?? {},
    };

    const imageCreate = uploaded.map((img, idx) => ({
      url: img.url, publicId: img.publicId, width: img.width, height: img.height,
      alt: nameL.en, position: idx,
    }));
    const variantCreate = (p.variants ?? []).map((v, idx) => ({
      label: L(v.label) ?? { en: "", fr: "" },
      priceCents: cents(v.price, v.priceCents) ?? priceCents,
      position: idx,
    }));
    const collectionCreate = collectionIds.map((id, idx) => ({ collectionId: id, position: idx }));

    if (existing) {
      // --overwrite: only what the file states. A key left out of the file
      // must not fall back to a create-time default (leadTimeDays 1, status
      // ACTIVE, empty contents) and wipe the live value.
      const has = (k: keyof InputProduct) => p[k] !== undefined;
      const patch: Partial<typeof data> = { name: data.name, priceCents: data.priceCents };
      if (has("tagline")) patch.tagline = data.tagline;
      if (has("description")) patch.description = data.description;
      if (has("care")) patch.care = data.care;
      if (has("contents")) patch.contents = data.contents;
      if (has("compareAt") || has("compareAtCents")) patch.compareAtCents = data.compareAtCents;
      if (has("sku")) patch.sku = data.sku;
      if (has("status")) patch.status = data.status;
      if (has("featured")) patch.featured = data.featured;
      if (has("bestseller")) patch.bestseller = data.bestseller;
      if (has("badges")) patch.badges = data.badges;
      if (has("leadTimeDays")) patch.leadTimeDays = data.leadTimeDays;
      if (has("shippable")) patch.shippable = data.shippable;
      if (has("inventory")) patch.inventory = data.inventory;
      if (has("seoTitle")) patch.seoTitle = data.seoTitle;
      if (has("seoDescription")) patch.seoDescription = data.seoDescription;

      // Photos are replaced only when new ones actually uploaded; a missing or
      // failed image must not leave the product with none.
      const replaceImages = imageCreate.length > 0;
      const replaceVariants = has("variants");
      const replaceCollections = has("occasions") || has("recipients") || has("categories");

      await prisma.$transaction([
        ...(replaceImages ? [prisma.productImage.deleteMany({ where: { productId: existing.id } })] : []),
        ...(replaceVariants ? [prisma.productVariant.deleteMany({ where: { productId: existing.id } })] : []),
        ...(replaceCollections ? [prisma.productCollection.deleteMany({ where: { productId: existing.id } })] : []),
        prisma.product.update({
          where: { id: existing.id },
          data: {
            ...patch,
            ...(replaceImages ? { images: { create: imageCreate } } : {}),
            ...(replaceVariants ? { variants: { create: variantCreate } } : {}),
            ...(replaceCollections ? { collections: { create: collectionCreate } } : {}),
          },
        }),
      ]);
      // Old photos leave Cloudinary only once the new ones are saved.
      if (replaceImages) {
        for (const img of existing.images) if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      }
      console.log(`updated: ${nameL.en}`);
    } else {
      await prisma.product.create({
        data: {
          slug, ...data,
          images: { create: imageCreate },
          variants: { create: variantCreate },
          collections: { create: collectionCreate },
        },
      });
      console.log(`created: ${nameL.en}`);
    }
    ok++;
  }

  console.log(`\nDone. ${ok}/${products.length} products imported.`);
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log("  - " + w);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
