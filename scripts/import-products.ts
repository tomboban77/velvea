/**
 * Bulk product importer.
 *
 * 1. Put your product photos in:   import/images/
 * 2. Fill your products in:         import/products.json   (see import/products.example.json)
 * 3. Run:                           npm run import:products
 *
 * Images are uploaded to Cloudinary; products are created/updated by slug.
 * Re-running updates existing products (matched by slug) and replaces their images.
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
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
      leadTimeDays: p.leadTimeDays ?? 1,
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

    const existing = await prisma.product.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (existing) {
      // remove old Cloudinary images we uploaded before, then replace
      for (const img of existing.images) if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: existing.id } }),
        prisma.productVariant.deleteMany({ where: { productId: existing.id } }),
        prisma.productCollection.deleteMany({ where: { productId: existing.id } }),
        prisma.product.update({
          where: { id: existing.id },
          data: {
            ...data,
            images: { create: imageCreate },
            variants: { create: variantCreate },
            collections: { create: collectionCreate },
          },
        }),
      ]);
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
