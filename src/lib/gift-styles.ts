/**
 * Gift styles: looks a customer can start from, not products. A style has no
 * price, no stock and no checkout. Its only action is "Customize this style",
 * which opens the custom basket request form (/custom-basket?style=<slug>) so
 * the customer says what goes inside and we reply with a quote.
 *
 * Styles are generic. None belongs to an occasion: the same five looks serve an
 * anniversary, a birthday, Valentine's Day or a gift for him or her, and the
 * customer says which when they send the request. The photos happen to read
 * "Happy Anniversary"; the gallery note says the card wording is theirs to set.
 *
 * They live in code, with their images in /public/styles, because they are a
 * handful of editorial entries: no schema change, no admin screen, and nothing
 * that could be added to a cart by accident. Adding a style is one entry here
 * plus one image.
 *
 * The photos are styled illustrations, not photographs of stock. Copy here
 * describes the presentation and never promises a specific brand or item; the
 * gallery says so in words (messages: styles.note). Keep both true when adding
 * entries.
 */

type Bilingual = { en: string; fr: string };

export type GiftStyle = {
  slug: string;
  /**
   * Short reference shown on the card, in the emails and in admin, so a
   * customer on the phone and the owner reading a request mean the same
   * picture. Permanent: never reuse or renumber a code, even if the style is
   * renamed or retired, because stored requests carry it.
   */
  code: string;
  image: { src: string; width: number; height: number };
  name: Bilingual;
  /** One sentence on the look. Doubles as the image's alt text. */
  summary: Bilingual;
  /** Three prompts for what the customer can change. */
  ideas: Bilingual[];
};

export const GIFT_STYLES: GiftStyle[] = [
  {
    slug: "keepsake-display-box",
    code: "VS-01",
    image: { src: "/styles/keepsake-display-box.webp", width: 1200, height: 1200 },
    name: { en: "Keepsake Display Box", fr: "Coffret vitrine souvenir" },
    summary: {
      en: "A clear display box lit with warm fairy lights, holding roses, your own framed photos, chocolates and a wrapped gift.",
      fr: "Un coffret transparent éclairé de petites lumières chaudes, avec des roses, vos photos encadrées, des chocolats et un cadeau emballé.",
    },
    ideas: [
      { en: "Send us the photos you want framed", fr: "Envoyez-nous les photos à encadrer" },
      { en: "Pick the rose colours", fr: "Choisissez la couleur des roses" },
      { en: "Tell us what the wrapped gift should be", fr: "Dites-nous quel cadeau emballer" },
    ],
  },
  {
    slug: "chocolate-roses-box",
    code: "VS-02",
    image: { src: "/styles/chocolate-roses-box.webp", width: 1200, height: 1200 },
    name: { en: "Chocolate and Roses Box", fr: "Coffret chocolats et roses" },
    summary: {
      en: "An open ivory box of truffles, cookies and a small wrapped gift, set among red and blush roses and tied with a burgundy ribbon.",
      fr: "Un coffret ivoire ouvert garni de truffes, de biscuits et d’un petit cadeau emballé, entouré de roses rouges et rose pâle et noué d’un ruban bourgogne.",
    },
    ideas: [
      { en: "Choose the chocolates and sweets", fr: "Choisissez les chocolats et les douceurs" },
      { en: "Change the flowers or the colours", fr: "Changez les fleurs ou les couleurs" },
      { en: "Add a keepsake of your choosing", fr: "Ajoutez un souvenir de votre choix" },
    ],
  },
  {
    slug: "blush-jewellery-box",
    code: "VS-03",
    image: { src: "/styles/blush-jewellery-box.webp", width: 1200, height: 1200 },
    name: { en: "Blush Jewellery Box", fr: "Coffret bijoux rose poudré" },
    summary: {
      en: "A blush pink gift box with room for jewellery or a watch, a fragrance set, roses, chocolates and shortbread.",
      fr: "Un coffret rose poudré pouvant accueillir un bijou ou une montre, un coffret parfum, des roses, des chocolats et des sablés.",
    },
    ideas: [
      { en: "Choose the jewellery or keepsake to feature", fr: "Choisissez le bijou ou le souvenir à mettre en valeur" },
      { en: "Change the box and ribbon colours", fr: "Changez la couleur du coffret et du ruban" },
      { en: "Swap the sweets for their favourites", fr: "Remplacez les douceurs par ses préférées" },
    ],
  },
  {
    slug: "rose-bouquet-gift",
    code: "VS-04",
    image: { src: "/styles/rose-bouquet-gift.webp", width: 1200, height: 1247 },
    name: { en: "Rose Bouquet with a Hidden Gift", fr: "Bouquet de roses et cadeau caché" },
    summary: {
      en: "A dozen red roses and baby's breath in a black wrap, with a ribboned gift box tucked into the centre.",
      fr: "Une douzaine de roses rouges et de la gypsophile dans un emballage noir, avec un petit coffret enrubanné niché au centre.",
    },
    ideas: [
      { en: "Choose how many roses and which colour", fr: "Choisissez le nombre de roses et leur couleur" },
      { en: "Tell us what goes in the box", fr: "Dites-nous quoi mettre dans le coffret" },
      { en: "Change the wrap and ribbon", fr: "Changez l’emballage et le ruban" },
    ],
  },
  {
    slug: "favourites-tray",
    code: "VS-05",
    image: { src: "/styles/favourites-tray.webp", width: 1200, height: 800 },
    name: { en: "Favourites Tray", fr: "Plateau des favoris" },
    summary: {
      en: "A presentation tray built around one main gift, with a fragrance, chocolates and a few smaller treats framed by roses and hydrangea.",
      fr: "Un plateau de présentation composé autour d’un cadeau principal, avec un parfum, des chocolats et quelques petites attentions, encadrés de roses et d’hortensias.",
    },
    ideas: [
      { en: "Tell us the main gift you have in mind", fr: "Dites-nous le cadeau principal que vous avez en tête" },
      { en: "Name the brands or scents they love", fr: "Nommez les marques ou les parfums préférés" },
      { en: "Choose the wording on the front of the tray", fr: "Choisissez le message à l’avant du plateau" },
    ],
  },
];

/** Id of the gallery section; the header links to it on the home page. */
export const GIFT_STYLES_ANCHOR = "gift-styles";

export function getGiftStyle(slug: string | null | undefined): GiftStyle | null {
  if (!slug) return null;
  return GIFT_STYLES.find((s) => s.slug === slug) ?? null;
}

/**
 * Collection pages (occasions and recipients) that show the gallery under their
 * baskets: the romantic and personal ones, where someone is most likely to want
 * a one-off look. Home and /custom-basket always show it. Sympathy, corporate
 * and the like are left out on purpose; roses and ribbons are wrong there.
 */
const STYLE_COLLECTION_SLUGS = new Set([
  "anniversary",
  "birthday",
  "milestone-birthday",
  "valentines",
  "proposal",
  "just-because",
  "for-her",
  "for-him",
  "couples",
]);

export const showsGiftStyles = (collectionSlug: string) => STYLE_COLLECTION_SLUGS.has(collectionSlug);

/**
 * A request that starts from a style is stored in the request's existing
 * `productName` column in this form and with no product link, because the table
 * has no column for styles and adding one means a migration on the production
 * database. Admin reads it back to show the style's code, name and photo
 * instead of a basket that has left the catalogue.
 */
const STYLE_LABEL = /^Style (VS-\d+): (.+)$/;

/** e.g. "Style VS-01: Keepsake Display Box". The code is what admin looks up; the name is for reading. */
export const styleRequestLabel = (style: GiftStyle) => `Style ${style.code}: ${style.name.en}`;

/**
 * Reads a stored label back. Null when it is a basket's name. `style` is the
 * current entry for the code (photo, link), or null once the style has been
 * removed from the list; the code and the name as requested survive either way.
 */
export function styleFromLabel(
  label: string | null | undefined
): { code: string; name: string; style: GiftStyle | null } | null {
  const m = label ? STYLE_LABEL.exec(label) : null;
  if (!m) return null;
  return { code: m[1], name: m[2], style: GIFT_STYLES.find((s) => s.code === m[1]) ?? null };
}
