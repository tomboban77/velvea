/**
 * Catalogue corrections from the photo / contents / description audit of
 * 27 Nov 2026. The owner went through the findings one by one and said what
 * to do with each; this applies exactly those answers.
 *
 *   npx tsx --env-file=.env scripts/catalogue-photo-fixes.ts            # report only
 *   npx tsx --env-file=.env scripts/catalogue-photo-fixes.ts --apply    # write
 *
 * Runs against PRODUCTION (.env). It edits product copy, one price, one
 * status and one image row; nothing else.
 *
 * - Every text edit names the exact wording it expects to find. If that
 *   wording is gone and the new wording is not there either, the run stops
 *   before anything is written, so it can never overwrite a later edit made
 *   in the admin.
 * - Idempotent: a second run reports everything as already done.
 * - The replaced Little One photo is left in Cloudinary on purpose, so the
 *   swap can be undone by pointing the row back at it.
 */
import { readFileSync } from "node:fs";
import { PrismaClient, type Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient();

type Lang = "en" | "fr";
type Bi = { en?: string; fr?: string };
type TextField = "name" | "description" | "care" | "seoTitle" | "seoDescription";

type Edit =
  | { kind: "replace"; field: TextField; lang: Lang; from: string; to: string }
  | { kind: "set"; field: TextField; lang: Lang; to: string }
  | { kind: "content"; index: number; lang: Lang; from: string; to: string }
  | { kind: "addContent"; en: string; fr: string }
  | { kind: "price"; from: number; to: number }
  | { kind: "status"; to: "ARCHIVED" }
  | { kind: "alt"; from: string; to: string }
  | { kind: "image"; oldPublicIdPart: string; file: string };

const rep = (field: TextField, lang: Lang, from: string, to: string): Edit => ({ kind: "replace", field, lang, from, to });
const item = (index: number, lang: Lang, from: string, to: string): Edit => ({ kind: "content", index, lang, from, to });

const FIXES: { slug: string; why: string; edits: Edit[] }[] = [
  {
    slug: "little-one-welcome-gift-box",
    why: "New photo (import/images/baby1.png) shows the socks and six washcloths the listing promises.",
    edits: [{ kind: "image", oldPublicIdPart: "kizvpgah6vrwlmgls9zo", file: "import/images/baby1.png" }],
  },
  {
    slug: "home-sweet-home-kitchen-gift-hamper",
    why: "The photo shows a woven basket, so the text says basket too.",
    edits: [
      rep("description", "en", "Beautifully arranged in a cream gift box with an olive-green satin ribbon", "Beautifully arranged in a natural woven basket with an olive-green satin ribbon"),
      rep("description", "fr", "Soigneusement présenté dans un coffret cadeau crème avec un ruban satiné vert olive", "Soigneusement présenté dans un panier tressé naturel avec un ruban satiné vert olive"),
      item(9, "en", "Premium Cream Rigid Gift Box with Olive-Green Satin Ribbon", "Natural Woven Gift Basket with Olive-Green Satin Ribbon"),
      item(9, "fr", "Coffret cadeau rigide crème avec ruban satiné vert olive", "Panier-cadeau tressé naturel avec ruban satiné vert olive"),
    ],
  },
  {
    slug: "diwali-wishes-gift-box",
    why: "Name lost the word Diwali; the English contents line said Kaju Katli where the photo, the description and the French line all say dry fruit.",
    edits: [
      rep("name", "en", "Wishes Gift Box", "Diwali Wishes Gift Box"),
      rep("name", "fr", "Coffret cadeau Vœux de", "Coffret cadeau Vœux de Diwali"),
      item(1, "en", "Kaju Katli 300g", "Assorted dry fruit gift box"),
    ],
  },
  {
    slug: "italian-gourmet-celebration-gift-hamper",
    why: "Bottle in the photo is labelled 0.0% alcohol. 'Italian' comes out of the name everywhere; the URL stays so existing links keep working.",
    edits: [
      rep("description", "en", "The sparkling drink contains less than 0.5% alcohol.", "The sparkling drink is alcohol-free (0.0% alcohol)."),
      rep("description", "fr", "La boisson mousseuse contient moins de 0,5 % d'alcool.", "La boisson mousseuse est sans alcool (0,0 % d'alcool)."),
      rep("description", "fr", "Le coffret Célébration Gourmande Italienne réunit", "Le coffret Célébration Gourmande réunit"),
      rep("name", "fr", "Coffret-cadeau Célébration Gourmande Italienne", "Coffret-cadeau Célébration Gourmande"),
      rep("seoTitle", "en", "Italian Gourmet Gift Hamper | Luxury Gifts | Velvea", "Gourmet Celebration Gift Hamper | Luxury Gifts | Velvea"),
      rep("seoTitle", "fr", "Coffret-cadeau gourmand italien | Cadeaux de luxe | Velvea", "Coffret-cadeau Célébration Gourmande | Cadeaux de luxe | Velvea"),
      rep("seoDescription", "en", "Velvea's Italian Gourmet Celebration Hamper", "Velvea's Gourmet Celebration Hamper"),
      rep("seoDescription", "fr", "Le coffret Célébration Gourmande Italienne de Velvea", "Le coffret Célébration Gourmande de Velvea"),
      { kind: "alt", from: "Italian Gourmet Celebration Gift Hamper", to: "Gourmet Celebration Gift Hamper" },
    ],
  },
  {
    slug: "baby-snuggles-gift-hamper",
    why: "The towel set in the photo has four washcloths.",
    edits: [
      item(2, "en", "Soft Hooded Baby Towel & Washcloth Set – 1 Hooded Towel + 5 Washcloths", "Baby Hooded Towel Set – 1 Hooded Towel + 4 Washcloths"),
      item(2, "fr", "Ensemble serviette à capuchon et débarbouillettes – 1 serviette à capuchon + 5 débarbouillettes", "Ensemble serviette à capuchon pour bébé – 1 serviette à capuchon + 4 débarbouillettes"),
    ],
  },
  {
    slug: "cozy-new-beginnings-housewarming-basket",
    why: "50 × 60 in is the standard throw size and what the tag in the photo says.",
    edits: [
      item(0, "en", "Soft Chenille Throw Blanket – Neutral Beige/Grey, Approximately 50 × 72 in", "Soft Chenille Throw Blanket – Neutral Beige/Grey, Approximately 50 × 60 in"),
      item(0, "fr", "Jeté doux en chenille – Beige/gris neutre, environ 50 × 72 po", "Jeté doux en chenille – Beige/gris neutre, environ 50 × 60 po"),
    ],
  },
  {
    slug: "cocoa-clementine-gift-basket",
    why: "The Lindt bar pictured is the hazelnut one (100 g in Canada); the Canadian Dairy Milk Biscoff bar is 95 g.",
    edits: [
      item(1, "en", "Lindt Swiss Classic Milk Chocolate Bar, 100 g", "Lindt Swiss Classic Hazelnut Milk Chocolate Bar, 100 g"),
      item(1, "fr", "Tablette de chocolat au lait Lindt Swiss Classic, 100 g", "Tablette de chocolat au lait aux noisettes Lindt Swiss Classic, 100 g"),
      item(0, "en", "Cadbury Dairy Milk Biscoff Chocolate Bar, 90 g", "Cadbury Dairy Milk Biscoff Chocolate Bar, 95 g"),
      item(0, "fr", "Tablette de chocolat Cadbury Dairy Milk Biscoff, 90 g", "Tablette de chocolat Cadbury Dairy Milk Biscoff, 95 g"),
    ],
  },
  {
    slug: "blush-bliss-beauty-gift-box",
    why: "The Cadbury bar pictured is the Biscoff one (95 g in Canada). The Sephora line is the closest current product, the Bamboo + Rose hand cream.",
    edits: [
      item(5, "en", "Cadbury Dairy Milk Chocolate, 180 g", "Cadbury Dairy Milk Biscoff Chocolate Bar, 95 g"),
      item(5, "fr", "Chocolat Cadbury Dairy Milk, 180 g", "Tablette de chocolat Cadbury Dairy Milk Biscoff, 95 g"),
      item(3, "en", "SEPHORA COLLECTION Rose Hand Care", "SEPHORA COLLECTION Bamboo + Rose Hydrating Hand Cream, 30 mL"),
      item(3, "fr", "Soin des mains à la rose SEPHORA COLLECTION", "Crème hydratante pour les mains Bambou + Rose SEPHORA COLLECTION, 30 mL"),
    ],
  },
  {
    slug: "petals-glow-luxury-beauty-basket",
    why: "Basket was missing from the contents. It stays shippable within Canada, with a note that fresh roses can suffer on long courier trips.",
    edits: [
      { kind: "addContent", en: "Woven handled basket with yellow satin ribbon", fr: "Panier tressé à anse avec ruban satiné jaune" },
      {
        kind: "set", field: "care", lang: "en",
        to: "This basket is made with fresh roses. We ship it by courier anywhere in Canada, but flowers are delicate, and on a long trip to a distant address they can arrive bruised, wilted or damaged. For roses at their best, choose local delivery or pickup in the GTA.",
      },
      {
        kind: "set", field: "care", lang: "fr",
        to: "Ce panier est composé de roses fraîches. Nous l'expédions par messagerie partout au Canada, mais les fleurs sont fragiles et, lors d'un long trajet vers une adresse éloignée, elles peuvent arriver abîmées ou fanées. Pour des roses à leur meilleur, choisissez la livraison locale ou le ramassage dans la région du Grand Toronto.",
      },
    ],
  },
  {
    slug: "diwali-celebration-gift-hamper",
    why: "Besan Burfi box is 400 g; price goes up by $10 to $85, and the search snippet follows it.",
    edits: [
      item(1, "en", "Brar's Besan Burfi, 225 g", "Brar's Besan Burfi, 400 g"),
      item(1, "fr", "Besan Burfi de Brar's, 225 g", "Besan Burfi de Brar's, 400 g"),
      { kind: "price", from: 7500, to: 8500 },
      rep("seoDescription", "en", "Velvea's $59 gift hamper", "Velvea's $85 gift hamper"),
      rep("seoDescription", "fr", "à 59 $", "à 85 $"),
    ],
  },
  {
    slug: "diwali-marigold-hamper",
    why: "Owner asked for it to be taken out of the shop. Archived rather than deleted so it can be brought back.",
    edits: [{ kind: "status", to: "ARCHIVED" }],
  },
  {
    slug: "welcome-little-prince-baby-gift-box",
    why: "Search snippet quoted $99; the box is $129.",
    edits: [rep("seoDescription", "en", "$99", "$129"), rep("seoDescription", "fr", "99 $", "129 $")],
  },
  {
    slug: "welcome-little-princess-baby-gift-box",
    why: "Search snippet quoted $99; the box is $129.",
    edits: [rep("seoDescription", "en", "$99", "$129"), rep("seoDescription", "fr", "99 $", "129 $")],
  },
  {
    slug: "rose-radiance-gift-basket",
    why: "Name is Rosé Radiance / Éclat Rosé; the description and SEO text spelled it differently.",
    edits: [
      rep("description", "en", "The Rose Radiance Gift Basket", "The Rosé Radiance Gift Basket"),
      rep("seoTitle", "en", "Rose Radiance Gift Basket", "Rosé Radiance Gift Basket"),
      rep("seoDescription", "en", "the Rose Radiance Gift Basket", "the Rosé Radiance Gift Basket"),
      rep("description", "fr", "Le panier-cadeau Éclat de Rose", "Le panier-cadeau Éclat Rosé"),
      rep("seoTitle", "fr", "Panier-cadeau Éclat de Rose", "Panier-cadeau Éclat Rosé"),
      rep("seoDescription", "fr", "le panier Éclat de Rose", "le panier Éclat Rosé"),
    ],
  },
  {
    slug: "vegan-coffee-gourmet-gift-box",
    why: "The coffee in the box is instant, as the contents list says.",
    edits: [
      rep("description", "en", "Farm Boy's organic Arabica coffee", "Farm Boy's organic instant coffee"),
      rep("description", "fr", "Du café Arabica biologique", "Du café instantané biologique"),
    ],
  },
];

async function main() {
  let pending = 0;
  let done = 0;
  const problems: string[] = [];
  const writes: (() => Promise<unknown>)[] = [];
  const uploads: { imageId: string; file: string }[] = [];

  for (const fix of FIXES) {
    const p = await prisma.product.findUnique({
      where: { slug: fix.slug },
      include: { images: { orderBy: { position: "asc" } }, variants: { select: { id: true } } },
    });
    if (!p) {
      problems.push(`${fix.slug}: product not found`);
      continue;
    }
    console.log(`\n${fix.slug}\n  ${fix.why}`);
    const data: Prisma.ProductUpdateInput = {};
    const text: Partial<Record<TextField, Bi>> = {};
    const cur = (f: TextField): Bi => (text[f] ??= { ...((p[f] as Bi | null) ?? {}) });
    let contents: Bi[] | null = null;
    const list = (): Bi[] => (contents ??= ((p.contents as Bi[] | null) ?? []).map((c) => ({ ...c })));
    const todo = (label: string, from: string, to: string) => {
      pending++;
      console.log(`  CHANGE ${label}\n      - ${from}\n      + ${to}`);
    };
    const skip = (label: string) => {
      done++;
      console.log(`  done   ${label}`);
    };

    for (const e of fix.edits) {
      if (e.kind === "replace") {
        const label = `${e.field}.${e.lang}`;
        const v = cur(e.field)[e.lang] ?? "";
        // Adding a word makes `to` contain `from`; removing one makes `from`
        // contain `to`. Either way the longer wording is the one that tells
        // the two states apart, so "already done" is decided on that.
        const isDone = e.from.includes(e.to) ? !v.includes(e.from) && v.includes(e.to) : v.includes(e.to);
        if (isDone) skip(label);
        else if (v.includes(e.from)) {
          cur(e.field)[e.lang] = v.replace(e.from, e.to);
          todo(label, e.from, e.to);
        } else problems.push(`${fix.slug} ${label}: expected "${e.from}"`);
      } else if (e.kind === "set") {
        const label = `${e.field}.${e.lang}`;
        const v = cur(e.field)[e.lang] ?? "";
        if (v === e.to) skip(label);
        else if (v === "") {
          cur(e.field)[e.lang] = e.to;
          todo(label, "(empty)", e.to);
        } else problems.push(`${fix.slug} ${label}: expected it to be empty, found "${v}"`);
      } else if (e.kind === "content") {
        const label = `contents[${e.index}].${e.lang}`;
        const v = list()[e.index]?.[e.lang];
        if (v === e.to) skip(label);
        else if (v === e.from) {
          list()[e.index][e.lang] = e.to;
          todo(label, e.from, e.to);
        } else problems.push(`${fix.slug} ${label}: expected "${e.from}", found "${v}"`);
      } else if (e.kind === "addContent") {
        if (list().some((c) => c.en === e.en)) skip("contents (new line)");
        else {
          list().push({ en: e.en, fr: e.fr });
          todo("contents (new line)", "(none)", `${e.en} / ${e.fr}`);
        }
      } else if (e.kind === "price") {
        if (p.variants.length) problems.push(`${fix.slug}: has variants, price needs a manual look`);
        else if (p.priceCents === e.to) skip("price");
        else if (p.priceCents === e.from) {
          data.priceCents = e.to;
          todo("price", `$${e.from / 100}`, `$${e.to / 100}`);
        } else problems.push(`${fix.slug} price: expected ${e.from}, found ${p.priceCents}`);
      } else if (e.kind === "status") {
        if (p.status === e.to) skip("status");
        else {
          data.status = e.to;
          todo("status", p.status, e.to);
        }
      } else if (e.kind === "alt") {
        const img = p.images[0];
        if (!img) problems.push(`${fix.slug}: no image row`);
        else if (img.alt === e.to) skip("image alt");
        else if (img.alt === e.from) {
          writes.push(() => prisma.productImage.update({ where: { id: img.id }, data: { alt: e.to } }));
          todo("image alt", e.from, e.to);
        } else problems.push(`${fix.slug} image alt: expected "${e.from}", found "${img.alt}"`);
      } else if (e.kind === "image") {
        const img = p.images[0];
        if (!img) problems.push(`${fix.slug}: no image row`);
        else if (!img.url.includes(e.oldPublicIdPart)) skip("image (already replaced)");
        else {
          readFileSync(e.file); // fail now, not mid-run, if the file is missing
          uploads.push({ imageId: img.id, file: e.file });
          todo("image", img.url, `upload of ${e.file}`);
        }
      }
    }

    for (const f of Object.keys(text) as TextField[]) data[f] = text[f] as Prisma.InputJsonValue;
    if (contents) data.contents = contents as Prisma.InputJsonValue;
    if (Object.keys(data).length) writes.push(() => prisma.product.update({ where: { id: p.id }, data }));
  }

  if (problems.length) {
    console.log("\nStopped, nothing written:");
    for (const m of problems) console.log("  " + m);
    process.exitCode = 1;
    return;
  }
  console.log(`\n${pending} change(s) to make, ${done} already done.`);
  if (!APPLY) {
    if (pending) console.log("Report only. Re-run with --apply to write.");
    return;
  }

  // Upload first: if Cloudinary refuses, no database row has moved yet.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  for (const u of uploads) {
    // Same folder and transformation as the admin uploader (src/lib/cloudinary.ts).
    const res = await cloudinary.uploader.upload(u.file, {
      folder: "velvea/products",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    console.log(`Uploaded ${u.file} -> ${res.secure_url}`);
    writes.push(() =>
      prisma.productImage.update({
        where: { id: u.imageId },
        data: { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height },
      }),
    );
  }
  for (const w of writes) await w();
  console.log("Written.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
