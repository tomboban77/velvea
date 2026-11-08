/**
 * Reviews left on the Velvéa Google Business Profile, shown on the homepage.
 *
 * Copied by hand from Google: there is no API key for the Places API, and a
 * hand-kept list means nothing on the homepage depends on a third party at
 * render time. Copy each review exactly as written (no tidying), and update
 * the rating and count together whenever a review is added.
 *
 * These are deliberately NOT emitted as JSON-LD. Google's review-snippet rules
 * exclude reviews collected on another site, and self-serving Organization
 * ratings are not eligible either; marking them up risks a manual action for
 * no gain. The on-site reviews (Review table) are a separate system.
 */

export type GoogleReview = {
  /** Display name as it appears on Google. Empty if Google hides it. */
  author: string;
  /** YYYY-MM-DD, the day the review was posted. Rendered as "2 weeks ago". */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Star-only reviews have no text; Google shows them, so do we. */
  text?: string;
  /** Product named in the review, if any. */
  product?: string;
};

/** The figures Google shows at the top of the profile. */
export const GOOGLE_RATING = { average: 5.0, count: 12 };

/**
 * The carousel shows these in this order, so the list is the running order:
 * the owner picks which reviews lead. The first seven are from 29 Oct 2026;
 * the rest were added 8 Nov 2026 to the end of the list. Names Google shows in
 * capitals or lowercase (PRACHI PAL, ADARSH REDDY, angela binny) are written in
 * normal case so the cards match.
 */
export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    author: "Kevin Ho",
    date: "2026-10-29",
    rating: 5,
    product: "Rose Glow Gift Basket",
    text: "Got the Rose and Glow gift basket for my wife and she absolutely loved it. Definitely worth it!",
  },
  {
    author: "Emma Lecour",
    date: "2026-10-28",
    rating: 5,
  },
  {
    author: "Vahid Reza Niazmand",
    date: "2026-10-29",
    rating: 5,
    product: "Rose Radiance Self-Care Gift Crate",
    text: "Bought the Rose & Radiance Self-Care Gift Crate for my girlfriend, and she absolutely loved it! Everything was beautifully packed, and it made such a lovely gift. Really happy with the purchase!",
  },
  {
    author: "Prachi Pal",
    date: "2026-10-29",
    rating: 5,
    product: "Rose Radiance Self-Care Gift Crate",
    text: "Got the rose and radiance self care gift crate for my friend’s birthday. She absolutely loved it. Highly recommended!!",
  },
  {
    author: "Malavika Madhu",
    date: "2026-10-29",
    rating: 5,
    product: "Crimson & Ivory Rose Bouquet",
    text: "Ordered the Crimson & Ivory Rose Bouquet from Velvea and it was absolutely beautiful! The roses were fresh, the colours looked lovely together, and the arrangement was just perfect. Really happy with the purchase and would definitely order again!",
  },
  {
    author: "Dershan",
    date: "2026-10-28",
    rating: 5,
    product: "Birthday Chocolate Bloom Box",
    text: "Bought the Birthday Chocolate Bloom Box from Velvea as a birthday gift, and absolutely loved it! The packaging was beautiful, everything was arranged so nicely, and it made the gift feel extra special. Really happy with my purchase. Would definitely recommend Velvea for gifting!",
  },
  {
    author: "Adarsh Reddy",
    date: "2026-10-29",
    rating: 5,
  },
  {
    author: "Steffy Johnson",
    date: "2026-11-02",
    rating: 5,
    product: "Birthday Chocolate Bloom Box",
    text: "Ordered the Birthday Chocolate Bloom Box from Velvea, and it was absolutely beautiful! The chocolates were nicely arranged, the packaging was lovely, and it made such a special birthday gift. Really happy with it!",
  },
  {
    author: "Angela Binny",
    date: "2026-11-06",
    rating: 5,
    product: "Golden Hour Coffee & Gourmet Gift Box",
    text: "Ordered the Golden Hour Coffee & Gourmet Gift Box for someone very special to me, and they absolutely loved it! Everything was beautifully packed, delivery was right on time, and the customer service was excellent. Really happy with the experience. Would definitely order again!",
  },
  {
    author: "Rony Boban",
    date: "2026-11-06",
    rating: 5,
    product: "Thanksgiving Harvest Gourmet Basket",
    text: "Loved the Thanksgiving Harvest Gourmet Basket from Velvea! The basket was nicely arranged with a good selection of treats. Great service and everything arrived on time. Would definitely recommend!",
  },
  {
    author: "Rosmi Srampickal",
    date: "2026-11-06",
    rating: 5,
    product: "Love in Bloom",
    text: "Ordered the \"Love in Bloom\" hamper for our anniversary, and it was absolutely beautiful! The fresh flowers, chocolates and beauty products were perfectly arranged. My husband loved it! Delivery was on time, and the whole experience was great. Thank you, Velvea!",
  },
  {
    author: "Vera Williams",
    date: "2026-11-06",
    rating: 5,
    text: "The package was satisfactory. Delivery was on time. Staff was courteous. I recommend Velvea anytime",
  },
];
