import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const L = (en: string, fr?: string) => ({ en, fr: fr || en });

type P = {
  slug: string;
  name: string; fr: string;
  tagline: string; taglineFr: string;
  description: string; descriptionFr: string;
  contents: string[];
  price: number; compareAt?: number;
  occasions: string[]; recipients: string[]; categories: string[];
  featured?: boolean; bestseller?: boolean; badges?: string[];
  image: string;
};

// Order matters: the LAST featured product created shows in the hero (by updatedAt).
const PRODUCTS: P[] = [
  {
    slug: "little-sunshine-baby",
    name: "The Little Sunshine Baby Basket",
    fr: "Panier bébé Petit Rayon de Soleil",
    tagline: "A soft welcome for the newest little one.",
    taglineFr: "Un doux accueil pour le nouveau venu.",
    description: "A tender basket to welcome a new arrival, hand-packed with a plush teddy, a keepsake board book and gentle everyday essentials.",
    descriptionFr: "Un panier tendre pour accueillir bébé, composé à la main avec un toutou, un livre souvenir et de doux essentiels.",
    contents: ["Plush teddy bear", "'You Are My Sunshine' board book", "Honey Sticks crayons", "Wooden ABC blocks", "Star-print baby blanket", "Butter cookies"],
    price: 11500,
    occasions: ["new-baby"], recipients: ["new-parents"], categories: ["baby"],
    featured: true, badges: ["new"],
    image: "/catalog/baby-sunshine.jpg",
  },
  {
    slug: "bright-minds-back-to-school",
    name: "Bright Minds Back-to-School Basket",
    fr: "Panier Rentrée Petits Génies",
    tagline: "Encouragement and supplies for a bright new year.",
    taglineFr: "Encouragement et fournitures pour une belle rentrée.",
    description: "A cheerful send-off for a new school year, filled with an encouraging plush, quality stationery and wholesome snacks.",
    descriptionFr: "Un départ joyeux pour la rentrée : un toutou encourageant, de belles fournitures et des collations saines.",
    contents: ["'You Got This' plush bear", "Motivational water bottle", "Faber-Castell colour pencils", "Stabilo highlighters", "Dinosaur lunch box", "MadeGood granola minis"],
    price: 9500,
    occasions: ["congratulations"], recipients: ["family", "a-friend"], categories: ["gourmet"],
    featured: true,
    image: "/catalog/back-to-school.jpg",
  },
  {
    slug: "the-gentlemans-retreat",
    name: "The Gentleman's Retreat",
    fr: "L'Évasion du Gentleman",
    tagline: "Considered comfort in navy and gold.",
    taglineFr: "Un confort raffiné en marine et or.",
    description: "A refined basket for him, pairing a woven throw and single-origin coffee with an amber candle and modern grooming.",
    descriptionFr: "Un panier raffiné pour lui : jeté tissé, café d'origine unique, bougie ambrée et soins modernes.",
    contents: ["Cloudweave navy luxe throw", "Single-origin Ethiopian coffee", "Artisan chocolates", "Oak & Amber soy candle", "Elemis Men moisturiser", "Insulated tumbler"],
    price: 15900,
    occasions: ["birthday", "thank-you", "congratulations"], recipients: ["for-him", "clients"], categories: ["coffee-tea", "chocolate"],
    featured: true, bestseller: true,
    image: "/catalog/for-him.jpg",
  },
  {
    slug: "for-an-incredible-dad",
    name: "For an Incredible Dad",
    fr: "Pour un Papa Formidable",
    tagline: "A warm thank-you for the man who does it all.",
    taglineFr: "Un merci chaleureux pour celui qui fait tout.",
    description: "A heartfelt basket for dad, with premium coffee, a sandalwood candle, fine chocolate and a keepsake engraved keychain.",
    descriptionFr: "Un panier sincère pour papa : café premium, bougie de santal, chocolat fin et porte-clés gravé souvenir.",
    contents: ["'Best Dad Ever' mug", "Velvea premium coffee", "Calm & Focused candle", "Bare 70% dark chocolate", "Knit throw", "Engraved 'DAD' keychain", "Insulated bottle"],
    price: 13500,
    occasions: ["birthday", "thank-you"], recipients: ["for-him"], categories: ["coffee-tea", "chocolate"],
    featured: true,
    image: "/catalog/for-dad.jpg",
  },
  {
    slug: "lavender-calm-birthday",
    name: "Lavender Calm Birthday Basket",
    fr: "Panier d'Anniversaire Lavande",
    tagline: "A soft, restful birthday in lilac and cream.",
    taglineFr: "Un anniversaire doux et reposant, lilas et crème.",
    description: "A serene birthday basket wrapped in lavender, with a scented candle, a luxe throw, fine bath care and English rose tea.",
    descriptionFr: "Un panier d'anniversaire serein aux teintes lavande : bougie parfumée, jeté douillet, soins du bain et thé à la rose.",
    contents: ["Sand + Fog Lavender Vanilla candle", "'Sip Smile Enjoy' tumbler", "Lindor chocolates", "Luxury Bathing soap & lotion", "Whittard English Rose tea", "CuddleCo luxe throw"],
    price: 12500,
    occasions: ["birthday", "get-well", "thank-you"], recipients: ["for-her"], categories: ["spa-wellness", "coffee-tea"],
    featured: true,
    image: "/catalog/lavender-birthday.jpg",
  },
  {
    slug: "just-for-you-romance",
    name: "Just For You Romance Basket",
    fr: "Panier Romantique Rien Que Pour Toi",
    tagline: "Blush roses and little luxuries, wrapped with love.",
    taglineFr: "Roses poudrées et petits luxes, emballés avec amour.",
    description: "A romantic basket in blush and gold, with roses, fine chocolate, a signature fragrance and a soft plush companion.",
    descriptionFr: "Un panier romantique en rose et or : roses, chocolat fin, parfum signature et un doux toutou.",
    contents: ["Plush teddy bear", "Ferrero Rocher", "'Love' heart mug", "Chanel Coco Mademoiselle", "A Thousand Wishes mist", "Rose Vanilla candle", "Blush rose bouquet"],
    price: 13900,
    occasions: ["anniversary", "birthday"], recipients: ["couples", "for-her"], categories: ["chocolate", "spa-wellness"],
    featured: true, bestseller: true, badges: ["bestseller"],
    image: "/catalog/romance-just-for-you.jpg",
  },
  {
    slug: "for-an-amazing-mom",
    name: "For an Amazing Mom",
    fr: "Pour une Maman Extraordinaire",
    tagline: "A little peace and a lot of gratitude.",
    taglineFr: "Un peu de sérénité et beaucoup de gratitude.",
    description: "An elegant basket for mom in navy and cream, with a bouquet, Godiva chocolates, a lavender candle and thoughtful self-care.",
    descriptionFr: "Un panier élégant pour maman, marine et crème : bouquet, chocolats Godiva, bougie lavande et soins attentionnés.",
    contents: ["White rose & eucalyptus bouquet", "Godiva assorted chocolates", "'Brighter Happier You' tumbler", "Peace in a Jar candle", "Herbivore bath soak", "L'Occitane hand cream", "Linen journal"],
    price: 13900,
    occasions: ["birthday", "thank-you", "anniversary"], recipients: ["for-her"], categories: ["spa-wellness", "chocolate"],
    featured: true, bestseller: true,
    image: "/catalog/for-mom.jpg",
  },
  {
    slug: "celebrate-you-birthday",
    name: "Celebrate You Birthday Basket",
    fr: "Panier d'Anniversaire Célébrez-Vous",
    tagline: "Here's to a brighter, happier year ahead.",
    taglineFr: "À une année plus lumineuse et plus heureuse.",
    description: "A polished birthday basket in navy and cream, with fresh blooms, Godiva chocolates, a candle, bath salts and keepsakes to mark the day.",
    descriptionFr: "Un panier d'anniversaire soigné, marine et crème : fleurs fraîches, chocolats Godiva, bougie, sels de bain et souvenirs pour marquer le jour.",
    contents: ["White rose & hydrangea bouquet", "Godiva assorted chocolates", "'Happiness Looks Good on You' candle", "Lavender & vanilla bath salt", "L'Occitane hand cream trio", "'Brighter Year' tumbler", "Trinket dish"],
    price: 12900, compareAt: 14500,
    occasions: ["birthday", "congratulations"], recipients: ["for-her", "a-friend"], categories: ["spa-wellness", "chocolate"],
    featured: true, bestseller: true, badges: ["bestseller"],
    image: "/catalog/birthday-celebrate.jpg",
  },
];

async function main() {
  console.log("Attaching photographed products...");
  const collections = await prisma.collection.findMany();
  const cid = (slug: string) => collections.find((c) => c.slug === slug)?.id;

  const keepSlugs = PRODUCTS.map((p) => p.slug);

  for (const p of PRODUCTS) {
    const collectionIds = [...p.occasions, ...p.recipients, ...p.categories]
      .map(cid)
      .filter(Boolean) as string[];

    const base = {
      name: L(p.name, p.fr),
      tagline: L(p.tagline, p.taglineFr),
      description: L(p.description, p.descriptionFr),
      contents: p.contents.map((c) => L(c)),
      priceCents: p.price,
      compareAtCents: p.compareAt ?? null,
      status: "ACTIVE" as const,
      featured: p.featured ?? false,
      bestseller: p.bestseller ?? false,
      badges: p.badges ?? [],
      avgRating: 4.7 + Math.random() * 0.3,
      reviewCount: Math.floor(40 + Math.random() * 160),
    };

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: existing.id } }),
        prisma.productCollection.deleteMany({ where: { productId: existing.id } }),
        prisma.product.update({
          where: { id: existing.id },
          data: {
            ...base,
            images: { create: [{ url: p.image, alt: p.name, position: 0, width: 1232, height: 1232 }] },
            collections: { create: collectionIds.map((c, i) => ({ collectionId: c, position: i })) },
          },
        }),
      ]);
    } else {
      await prisma.product.create({
        data: {
          slug: p.slug,
          ...base,
          images: { create: [{ url: p.image, alt: p.name, position: 0, width: 1232, height: 1232 }] },
          collections: { create: collectionIds.map((c, i) => ({ collectionId: c, position: i })) },
        },
      });
    }
    console.log(`  - ${p.name}`);
  }

  // Lead with the photographed products: demote placeholder samples on the homepage.
  const demoted = await prisma.product.updateMany({
    where: { slug: { notIn: [...keepSlugs, "velvea-gift-card"] } },
    data: { featured: false, bestseller: false },
  });
  console.log(`  - demoted ${demoted.count} placeholder products from featured/bestseller`);

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
