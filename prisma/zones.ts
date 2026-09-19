import type { Prisma } from "@prisma/client";

const L = (en: string, fr: string) => ({ en, fr });

/**
 * Delivery zones for an Ontario-only store run out of Mississauga.
 *
 * Coverage is certain by construction: Canada Post assigns K, L, M, N and P to
 * Ontario and nothing else, so the letter-rule zones below reach every Ontario
 * address that exists — including the cities nobody thought to list — with no
 * maintenance. A destination outside those letters matches nothing and is
 * refused, which is the intent while we serve one province.
 *
 * The per-municipality FSA lists were checked against the published Canada
 * Post assignments rather than written from memory. Two corrections came out
 * of that check and are worth remembering, because both were wrong in ways
 * that cost money:
 *
 *   - M7R is Mississauga (airport/Gateway), not Toronto. Without an exact
 *     entry in Local A it falls to the "M" letter rule and is quoted the
 *     Toronto rate.
 *   - The fly-in list is not simply "the P0 codes". P0X (Kenora region) and
 *     P0Y (Whiteshell) are road-served and must ship normally; the fly-in
 *     concentration is P0V, plus the James Bay coast inside P0L.
 *
 * Where a local FSA is missing the error is cheap: that address drops to ON
 * Ground, which is still served at a rate that covers us. Where one is wrongly
 * included we promise a van we cannot send, so the local tiers stay tight.
 */
export const ZONE_SEED: Prisma.DeliveryZoneCreateInput[] = [
  {
    key: "pickup",
    // No street address in the name. The address lives in site settings and is
    // rendered from there at checkout and on the delivery page; repeating it
    // here only creates a second copy to forget to update.
    name: L("Pickup — our studio", "Ramassage — notre atelier"),
    kind: "PICKUP",
    baseFeeCents: 0,
    minLeadDays: 0,
    maxLeadDays: 1,
    sameDayCutoff: "16:00",
    position: 0,
    active: true,
  },

  // --- Local: we drive it ---------------------------------------------------
  {
    key: "local-a",
    name: L("Local A — Mississauga", "Local A — Mississauga"),
    kind: "LOCAL",
    // Every L5 FSA is Mississauga, and L4T/L4V–L4Z cover Malton, the airport
    // lands and east Mississauga. Canadian postal codes never use D, F, I, O,
    // Q or U, so those combinations are absent because they cannot exist.
    fsaPrefixes: [
      "L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z",
      "L5A", "L5B", "L5C", "L5E", "L5G", "L5H", "L5J", "L5K", "L5L",
      "L5M", "L5N", "L5P", "L5R", "L5S", "L5T", "L5V", "L5W",
      // Airport / Gateway. Without this it matches the "M" letter rule on
      // Local B and gets quoted the Toronto rate from two minutes away.
      "M7R",
    ],
    provinces: ["ON"],
    baseFeeCents: 999,
    extraItemCents: 0, // one trip carries the whole order
    sameDaySurchargeCents: 500, // a dedicated run, not a stop on tomorrow's route
    sameDayCutoff: "16:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 10,
    active: true,
  },
  {
    key: "local-b",
    name: L("Local B — Toronto", "Local B — Toronto"),
    kind: "LOCAL",
    // All of Toronto is M, with no exceptions and no other city inside it.
    fsaLetters: ["M"],
    provinces: ["ON"],
    baseFeeCents: 1499,
    extraItemCents: 0,
    sameDaySurchargeCents: 700,
    sameDayCutoff: "13:00", // earlier than Local A — it is a longer run
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 20,
    active: true,
  },
  {
    key: "local-b-west",
    name: L("Local B — Brampton, Oakville, Milton", "Local B — Brampton, Oakville, Milton"),
    kind: "LOCAL",
    fsaPrefixes: [
      // Brampton
      "L6P", "L6R", "L6S", "L6T", "L6V", "L6W", "L6X", "L6Y", "L6Z", "L7A",
      // Oakville
      "L6H", "L6J", "L6K", "L6L", "L6M",
      // Milton
      "L9E", "L9T",
    ],
    provinces: ["ON"],
    baseFeeCents: 1499,
    extraItemCents: 0,
    sameDaySurchargeCents: 700, // same distance band as Toronto
    sameDayCutoff: "13:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 21,
    active: true, // verified against the published assignments
  },
  {
    key: "local-b-york",
    name: L("Local B — Vaughan, Markham, Richmond Hill", "Local B — Vaughan, Markham, Richmond Hill"),
    kind: "LOCAL",
    fsaPrefixes: [
      // Vaughan — L3L is Woodbridge, which the first pass missed entirely.
      "L4H", "L4J", "L4K", "L4L", "L6A", "L3L",
      // Richmond Hill
      "L4B", "L4C", "L4E", "L4S",
      // Markham
      "L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G",
    ],
    provinces: ["ON"],
    baseFeeCents: 1499,
    extraItemCents: 0,
    sameDaySurchargeCents: 700, // same distance band as Toronto
    sameDayCutoff: "13:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 22,
    active: true, // verified; L3L added
  },
  {
    key: "local-c",
    name: L("Local C — Durham, Burlington, north GTA", "Local C — Durham, Burlington, nord du RGT"),
    kind: "LOCAL",
    fsaPrefixes: [
      // Durham: Pickering, Ajax, Whitby, Oshawa, Clarington
      "L1V", "L1W", "L1X", "L1Y", "L1S", "L1T", "L1Z",
      "L1M", "L1N", "L1P", "L1R", "L1G", "L1H", "L1J", "L1K", "L1L",
      "L1B", "L1C", "L1E",
      // Burlington
      "L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T",
      // Halton Hills, Caledon, Newmarket, Aurora, Stouffville, King
      "L7G", "L7J", "L7C", "L7E", "L7K", "L3X", "L3Y", "L4G", "L4A", "L7B",
    ],
    provinces: ["ON"],
    baseFeeCents: 1999,
    extraItemCents: 0,
    sameDayCutoff: null, // too far to promise same-day
    minLeadDays: 1,
    maxLeadDays: 2,
    position: 30,
    active: true, // verified against the published assignments
  },

  // --- Shipped: carrier -----------------------------------------------------
  {
    key: "on-ground",
    name: L("Ontario — ground", "Ontario — terrestre"),
    kind: "SHIPPING",
    // Everything in Ontario that no local tier claimed: Hamilton, Niagara,
    // Kitchener, Guelph, Barrie, London, Windsor, Ottawa, Kingston and the
    // several hundred smaller places nobody would have remembered to list.
    fsaLetters: ["K", "L", "N"],
    provinces: ["ON"],
    baseFeeCents: 1999,
    extraItemCents: 1200, // a second basket is a second parcel
    minLeadDays: 2,
    maxLeadDays: 3,
    position: 100,
    active: true,
  },
  {
    key: "on-north",
    name: L("Northern Ontario", "Nord de l'Ontario"),
    kind: "SHIPPING",
    // P is Northern Ontario in its entirety: Sudbury, North Bay, Sault Ste.
    // Marie, Timmins, Thunder Bay, Kenora. Sudbury is four hours away and
    // Kenora is twenty, so this over-charges the near north on purpose until
    // volume justifies splitting it.
    fsaLetters: ["P"],
    provinces: ["ON"],
    baseFeeCents: 2999,
    extraItemCents: 1500,
    minLeadDays: 3,
    maxLeadDays: 5,
    position: 110,
    active: true,
  },
  {
    key: "on-fly-in",
    name: L("Northern Ontario — remote", "Nord de l'Ontario — régions éloignées"),
    kind: "QUOTE",
    // Ontario addresses with no year-round road. A basket here costs more to
    // send than it costs to buy, so it is quoted by hand rather than sold at a
    // rate that loses money on every order. Exact prefixes beat the "P" letter
    // rule on the zone below, which is what carves these out of it.
    //
    // Only two, and not the five first guessed at:
    //   P0V — Northwestern Ontario, overwhelmingly fly-in: Sandy Lake,
    //         Pikangikum, Big Trout Lake, Fort Severn, Bearskin Lake.
    //   P0L — Cochrane District, which holds the James Bay coast: Attawapiskat,
    //         Fort Albany, Kashechewan, Peawanuck, Moosonee.
    //
    // P0X (Kenora region) and P0Y (Whiteshell) were in the first list and are
    // road-served — quoting them by hand would have turned away customers a
    // courier reaches perfectly well.
    //
    // Residual risk: P0T is mostly road-served (Geraldton, Marathon, Nipigon)
    // but does contain Webequie and Summer Beaver. It ships at the normal
    // northern rate; confirm against the carrier's remote-area surcharge list
    // once an account exists.
    fsaPrefixes: ["P0L", "P0V"],
    provinces: ["ON"],
    baseFeeCents: 0,
    minLeadDays: 5,
    maxLeadDays: 14,
    position: 90, // ahead of on-north, though an exact match wins regardless
    active: true,
  },
];
