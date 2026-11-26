import type { Prisma } from "@prisma/client";

const L = (en: string, fr: string) => ({ en, fr });

/** The 20 letters a postal code can use (never D, F, I, O, Q or U). */
const FSA_LETTERS = "ABCEGHJKLMNPRSTVWXYZ".split("");

/**
 * Every rural FSA under the given first letters: a "0" in second place is
 * Canada Post's mark for rural delivery. `except` drops the ones another
 * zone (quote-only, usually) has claimed.
 */
const rural = (letters: string[], except: string[] = []) =>
  letters.flatMap((l) => FSA_LETTERS.map((x) => `${l}0${x}`)).filter((fsa) => !except.includes(fsa));

/**
 * Delivery zones for an Ontario-only store run out of Mississauga.
 *
 * Coverage is certain by construction: Canada Post assigns K, L, M, N and P to
 * Ontario and nothing else, so the letter-rule zones below reach every Ontario
 * address that exists — including the cities nobody thought to list — with no
 * maintenance. A destination outside those letters matches nothing and is
 * refused, which is the intent while we serve one province. The national
 * zones at the bottom are seeded inactive for the day that changes.
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
    name: L("Pickup at our studio", "Ramassage à notre atelier"),
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
    name: L("Mississauga", "Mississauga"),
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
    // Noon across every GTA tier (owner decision, 3 Nov 2026): one cutoff is
    // easier to promise than one per distance band.
    sameDayCutoff: "12:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 10,
    active: true,
  },
  {
    key: "local-b",
    name: L("Toronto", "Toronto"),
    kind: "LOCAL",
    // All of Toronto is M, with no exceptions and no other city inside it.
    fsaLetters: ["M"],
    provinces: ["ON"],
    baseFeeCents: 1499,
    extraItemCents: 0,
    sameDaySurchargeCents: 700,
    sameDayCutoff: "12:00", // same as Local A since 3 Nov 2026
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 20,
    active: true,
  },
  {
    key: "local-b-west",
    name: L(
      "Brampton, Oakville, Milton, Burlington, Georgetown and Bolton",
      "Brampton, Oakville, Milton, Burlington, Georgetown et Bolton"
    ),
    kind: "LOCAL",
    fsaPrefixes: [
      // Brampton
      "L6P", "L6R", "L6S", "L6T", "L6V", "L6W", "L6X", "L6Y", "L6Z", "L7A",
      // Oakville
      "L6H", "L6J", "L6K", "L6L", "L6M",
      // Milton
      "L9E", "L9T",
      // Moved up from local-c on 24 Sept 2026 (owner decision): these now get
      // the Local B fee, the Local B same-day cutoff and 0-1 day lead times.
      // Burlington is the whole city; Georgetown is L7G only (L7J is Acton)
      // and Bolton is L7E only (L7C / L7K are elsewhere in Caledon), so the
      // rest of Halton Hills and Caledon stay on the slower Local C rate.
      "L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T",
      "L7G",
      "L7E",
    ],
    provinces: ["ON"],
    baseFeeCents: 1499,
    extraItemCents: 0,
    sameDaySurchargeCents: 700, // same distance band as Toronto
    sameDayCutoff: "12:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 21,
    active: true, // verified against the published assignments
  },
  {
    key: "local-b-york",
    name: L("Vaughan, Markham and Richmond Hill", "Vaughan, Markham et Richmond Hill"),
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
    sameDayCutoff: "12:00",
    minLeadDays: 0,
    maxLeadDays: 1,
    position: 22,
    active: true, // verified; L3L added
  },
  {
    key: "local-c",
    name: L("Durham and north GTA", "Durham et nord du RGT"),
    kind: "LOCAL",
    fsaPrefixes: [
      // Durham: Pickering, Ajax, Whitby, Oshawa, Clarington
      "L1V", "L1W", "L1X", "L1Y", "L1S", "L1T", "L1Z",
      "L1M", "L1N", "L1P", "L1R", "L1G", "L1H", "L1J", "L1K", "L1L",
      "L1B", "L1C", "L1E",
      // Acton, Caledon, Newmarket, Aurora, Stouffville, King. Burlington,
      // Georgetown (L7G) and Bolton (L7E) moved to local-b-west on
      // 24 Sept 2026; what is left here is genuinely further out.
      "L7J", "L7C", "L7K", "L3X", "L3Y", "L4G", "L4A", "L7B",
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
    name: L("Ontario (ground shipping)", "Ontario (expédition terrestre)"),
    kind: "SHIPPING",
    // Everything in Ontario that no local tier claimed: Hamilton, Niagara,
    // Kitchener, Guelph, Barrie, London, Windsor, Ottawa, Kingston and the
    // several hundred smaller places nobody would have remembered to list.
    fsaLetters: ["K", "L", "N"],
    provinces: ["ON"],
    // Kingston/Ottawa $31.85 by Canada Post Expedited (the 3rd cheapest
    // quote, see the note above the national zones) + $3 packing + $3 buffer.
    // History: $19.99 lost ~$9 a parcel, $28.99 broke even, $31.99 covered
    // only the cheapest carrier.
    baseFeeCents: 3799,
    extraItemCents: 2199, // a second basket is a second parcel
    minLeadDays: 2,
    maxLeadDays: 4,
    position: 100,
    active: true,
  },
  {
    key: "on-north",
    name: L("Northern Ontario", "Nord de l'Ontario"),
    kind: "SHIPPING",
    // P is Northern Ontario in its entirety: Sudbury, North Bay, Sault Ste.
    // Marie, Timmins, Thunder Bay. The Kenora corner has its own zone below
    // (on-northwest), matched by exact FSA ahead of this letter rule.
    fsaLetters: ["P"],
    provinces: ["ON"],
    // Priced to Thunder Bay: $42.38 by Canada Post Expedited + $3 packing
    // + $3 buffer. Sudbury and North Bay are $30.31.
    baseFeeCents: 4899,
    extraItemCents: 2799,
    minLeadDays: 2,
    maxLeadDays: 5,
    position: 110,
    active: true,
  },
  {
    key: "on-northwest",
    name: L("Northwestern Ontario", "Nord-ouest de l'Ontario"),
    kind: "SHIPPING",
    // Split out of on-north on 15 Nov 2026 (owner: no zone may sell at a
    // loss). Kenora was $40.08 against a $36.99 fee, and Sioux Lookout is
    // dearer still at $46.06; pricing all of the north to this corner would
    // have charged Sudbury $14 too much.
    //   P9N Kenora · P8N Dryden · P8T Sioux Lookout · P9A Fort Frances
    // The countryside around them (P0X, P0Y, P0W) moved to on-north-rural on
    // 26 Nov 2026 with every other rural code in the north.
    fsaPrefixes: ["P9N", "P8N", "P8T", "P9A"],
    provinces: ["ON"],
    // Sioux Lookout $52.85 by Canpar + $3 packing + $4 buffer. A second
    // parcel here nearly doubles the label ($50.06 -> $93.32 in Dryden),
    // hence the extra fee.
    baseFeeCents: 5999,
    extraItemCents: 4699,
    minLeadDays: 4,
    maxLeadDays: 6,
    position: 105,
    active: true,
  },
  {
    key: "on-fly-in",
    name: L("Remote northern Ontario", "Régions éloignées du nord de l’Ontario"),
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

  // --- Shipped: beyond Ontario ------------------------------------------------
  //
  // Live since the national launch; Quebec joined on 15 Nov 2026. They went
  // on with the remote carve-out, so fly-in addresses are never sold a road
  // rate. Kept in step with the live rows so a reseed of an empty database
  // comes back the same.
  //
  // Fees come from the ShipTime survey (npm run survey:shipping, 15 Nov 2026,
  // 40x30x30 cm / 4 kg box): the dearest sampled town in each zone, tax
  // included — we are not HST-registered, so label tax is a real cost — plus
  // ~$3 packing and a buffer ($3, or $4 for Atlantic, Newfoundland and BC),
  // rounded up to .99. The buffer exists because bare-cost fees turned into
  // losses within a month: St. John's went from $39 to $46. Lead days add one
  // for packing.
  //
  // Repriced 26 Nov 2026 (owner decision): every courier fee, Ontario's
  // included, now follows the 3RD cheapest trusted quote, not the cheapest.
  // The cheapest line (Canada Post Regular or Canpar) is the one that goes
  // missing between runs and the one a heavy basket gets billed up from; the
  // 3rd is Canada Post Expedited or Purolator Ground nearly everywhere, a
  // price we can still book when the first two fall through. It runs $6-15
  // above the cheapest. The 4th was looked at and rejected as a basis: it
  // jumps about (Kelowna $52 -> $72) depending on which carriers answer.
  // Weight is not the lever: a 40x30x30 box bills at ~7 kg by volume, and a
  // 7 kg run returned the same 3rd-cheapest prices as the 4 kg one.
  {
    key: "ca-remote",
    name: L("Remote communities", "Communautés éloignées"),
    kind: "QUOTE",
    // Fly-in and ferry-dependent FSAs inside the letter rules below, quoted
    // by hand for the same reason as on-fly-in:
    //   J0M — Nunavik (northern Quebec)
    //   A0P — coastal Labrador
    //   R0B — northern Manitoba (Churchill, most fly-in First Nations)
    //   V0T — Haida Gwaii and the central BC coast
    // Added 26 Nov 2026 from the rural survey, each too dear or too slow for
    // its province's rural rate:
    //   G0G — Quebec's far north shore (Havre-Saint-Pierre $63, roadless
    //         villages beyond it)
    //   J0Y — James Bay and northern Abitibi (Radisson $89)
    //   A0K — Newfoundland's Northern Peninsula (St. Anthony $81, 13 days)
    //   E5G — Grand Manan, by ferry ($74)
    // Confirm against ShipTime's remote-area surcharge list as orders arrive.
    fsaPrefixes: ["J0M", "A0P", "R0B", "V0T", "G0G", "J0Y", "A0K", "E5G"],
    baseFeeCents: 0,
    minLeadDays: 5,
    maxLeadDays: 14,
    position: 95,
    active: true, // live since the national launch
  },
  {
    key: "qc-ground",
    name: L("Quebec", "Québec"),
    kind: "SHIPPING",
    // Montréal, Québec City and Sherbrooke $32.17 by Canada Post Expedited
    // + $3 packing + $3 buffer.
    fsaLetters: ["G", "H", "J"],
    provinces: ["QC"],
    baseFeeCents: 3899,
    extraItemCents: 2499,
    minLeadDays: 3,
    maxLeadDays: 5,
    position: 120,
    active: true, // opened 15 Nov 2026 (owner decision)
  },
  {
    key: "atlantic",
    // The key predates the split and is recorded on past orders, so it stays
    // "atlantic" though Newfoundland now has its own zone below.
    name: L("Nova Scotia, New Brunswick and PEI", "Nouvelle-Écosse, Nouveau-Brunswick et Î.-P.-É."),
    kind: "SHIPPING",
    // Fredericton $48.42 by Canada Post Expedited + $3 packing + $4 buffer.
    // Halifax is $40.94.
    fsaLetters: ["B", "C", "E"],
    provinces: ["NS", "PE", "NB"],
    baseFeeCents: 5599,
    extraItemCents: 3499,
    minLeadDays: 3,
    maxLeadDays: 6,
    position: 130,
    active: true, // live since the national launch
  },
  {
    key: "nl",
    name: L("Newfoundland and Labrador", "Terre-Neuve-et-Labrador"),
    kind: "SHIPPING",
    // Split out of atlantic on 15 Nov 2026, when St. John's rose past the
    // Maritime fee. Corner Brook $60.51 by Canada Post Expedited + $3 packing
    // + $4 buffer; St. John's is $49.46.
    // Coastal Labrador (A0P) is still quoted by hand via ca-remote.
    // Residual risk: Labrador City and Happy Valley-Goose Bay (A2V, A0P/A0R)
    // have not been quoted and ride on this rate.
    fsaLetters: ["A"],
    provinces: ["NL"],
    baseFeeCents: 6799,
    extraItemCents: 3399, // Corner Brook: a second parcel adds $30.29
    minLeadDays: 5,
    maxLeadDays: 7,
    position: 135,
    active: true,
  },
  {
    key: "prairies",
    name: L("Prairies", "Prairies"),
    kind: "SHIPPING",
    // Saskatoon $43.59 by Canada Post Expedited + $3 packing + $3 buffer.
    // Calgary and Edmonton are $42.25, Winnipeg $39.12.
    fsaLetters: ["R", "S", "T"],
    provinces: ["MB", "SK", "AB"],
    baseFeeCents: 4999,
    extraItemCents: 3399,
    minLeadDays: 3,
    maxLeadDays: 5,
    position: 140,
    active: true, // live since the national launch
  },
  {
    key: "bc",
    name: L("British Columbia", "Colombie-Britannique"),
    kind: "SHIPPING",
    // Kelowna and Prince George $52.42 by Purolator Ground, 5 days, + $3
    // packing + $4 buffer. Vancouver is $43.23 in 4. A second parcel adds up
    // to $45 (Kelowna), hence the extra fee.
    // Five days in a truck: only baskets marked shippable should reach here.
    fsaLetters: ["V"],
    provinces: ["BC"],
    baseFeeCents: 5999,
    extraItemCents: 4899,
    minLeadDays: 4,
    maxLeadDays: 6,
    position: 150,
    active: true, // live since the national launch
  },
  // --- Shipped: rural tiers ---------------------------------------------------
  //
  // Added 26 Nov 2026 after a parcel to Hearst cost $87 against a fee set
  // from city quotes. Couriers (Canpar above all) add a beyond-point surcharge
  // for small towns that never shows in a downtown postal code: the same box
  // was $43 to Cochrane and $89 to Hearst. Canada Post does not do this, so
  // BOOK RURAL LABELS WITH CANADA POST where it quotes; these fees assume the
  // 3rd cheapest quote, which for a rural address is Canada Post Expedited or
  // Purolator Ground.
  //
  // A "0" as the second character of a postal code means rural delivery, so
  // each tier is its parent zone's letters + "0" + every third letter, minus
  // the FSAs already quoted by hand. Exact prefixes beat the parent's letter
  // rule, which is all it takes to carve these out. New Brunswick has no "0"
  // codes (its rural routes were renumbered), so rural NB stays on the
  // Maritime rate: not sampled, a known gap.
  //
  // Fee = dearest sampled rural town's 3rd cheapest label + $3 packing + $6
  // buffer (owner: keep delivery a bit high, nothing comes out of our own
  // pocket), rounded up to .99. The extra-basket fee is a whole second label
  // + packing: Canada Post gives no multi-piece discount and the couriers'
  // two-parcel quotes to these towns run past $100.
  {
    key: "on-ground-rural",
    name: L("Rural Ontario", "Ontario rural"),
    kind: "SHIPPING",
    // Barry's Bay $40.99; Tobermory, Bancroft and Pelee Island are $28-31.
    fsaPrefixes: rural(["K", "L", "N"]),
    provinces: ["ON"],
    baseFeeCents: 4999,
    extraItemCents: 4399,
    minLeadDays: 3,
    maxLeadDays: 6,
    position: 98,
    active: true,
  },
  {
    key: "on-north-rural",
    name: L("Rural northern Ontario", "Nord de l'Ontario rural"),
    kind: "SHIPPING",
    // Marathon $54.68; Chapleau, Wawa and Little Current are $45.13. Takes in
    // P0X, P0Y and P0W, which sat in on-northwest at a lower fee than this
    // one until today. P0L and P0V stay quote-only (on-fly-in).
    fsaPrefixes: rural(["P"], ["P0L", "P0V"]),
    provinces: ["ON"],
    baseFeeCents: 6399,
    extraItemCents: 5799,
    minLeadDays: 4,
    maxLeadDays: 6,
    position: 104,
    active: true,
  },
  {
    key: "qc-rural",
    name: L("Rural Quebec", "Québec rural"),
    kind: "SHIPPING",
    // Percé $49.09; Chibougamau (G8P, urban-style code, priced like a rural
    // one) $44.21; Val-David $39.57. The far north shore (G0G) and James Bay /
    // Abitibi (J0Y) are quoted by hand via ca-remote: Havre-Saint-Pierre is
    // $63 and Radisson $89.
    fsaPrefixes: [...rural(["G", "H", "J"], ["J0M", "G0G", "J0Y"]), "G8P"],
    provinces: ["QC"],
    baseFeeCents: 5899,
    extraItemCents: 5299,
    minLeadDays: 4,
    maxLeadDays: 7,
    position: 118,
    active: true,
  },
  {
    key: "atlantic-rural",
    name: L("Rural Nova Scotia and PEI", "Nouvelle-Écosse et Î.-P.-É. (régions rurales)"),
    kind: "SHIPPING",
    // Inverness (Cape Breton) $57.38; Digby $51.55; Tignish $48.42.
    fsaPrefixes: rural(["B", "C"]),
    provinces: ["NS", "PE"],
    baseFeeCents: 6699,
    extraItemCents: 6099,
    minLeadDays: 4,
    maxLeadDays: 8,
    position: 128,
    active: true,
  },
  {
    key: "nl-rural",
    name: L("Rural Newfoundland and Labrador", "Terre-Neuve-et-Labrador (régions rurales)"),
    kind: "SHIPPING",
    // Twillingate $60.51; Labrador City (A2V) $57.41. Thin evidence: Port aux
    // Basques returned no quote at all, so the fee carries extra room. The
    // Northern Peninsula (A0K: St. Anthony $80.67 and 13 days) and coastal
    // Labrador (A0P) are quoted by hand via ca-remote.
    fsaPrefixes: [...rural(["A"], ["A0P", "A0K"]), "A2V"],
    provinces: ["NL"],
    baseFeeCents: 7499,
    extraItemCents: 6499,
    minLeadDays: 6,
    maxLeadDays: 9,
    position: 133,
    active: true,
  },
  {
    key: "prairies-rural",
    name: L("Rural Prairies", "Prairies (régions rurales)"),
    kind: "SHIPPING",
    // La Ronge $73.66; Maple Creek $64.51; High Level $59.15; Swan River
    // $48.17. Maple Creek is ordinary southern farm country, so this is not
    // only a far-north price.
    fsaPrefixes: rural(["R", "S", "T"], ["R0B"]),
    provinces: ["MB", "SK", "AB"],
    baseFeeCents: 8299,
    extraItemCents: 7699,
    minLeadDays: 5,
    maxLeadDays: 7,
    position: 138,
    active: true,
  },
  {
    key: "bc-rural",
    name: L("Rural British Columbia", "Colombie-Britannique (régions rurales)"),
    kind: "SHIPPING",
    // Fort Nelson $61.51; Tofino and Nakusp $59.15; Smithers $57.79.
    fsaPrefixes: rural(["V"], ["V0T"]),
    provinces: ["BC"],
    baseFeeCents: 7099,
    extraItemCents: 6499,
    minLeadDays: 6,
    maxLeadDays: 9,
    position: 148,
    active: true,
  },
  {
    key: "yukon",
    name: L("Yukon", "Yukon"),
    kind: "QUOTE",
    // Only Canada Post Expedited reaches Whitehorse at a sane price ($55.25,
    // 7 days; the next options are $95 and $126), too slow for food to sell
    // at a fixed rate. NT and NU (X) stay unserved.
    fsaLetters: ["Y"],
    provinces: ["YT"],
    baseFeeCents: 0,
    minLeadDays: 7,
    maxLeadDays: 14,
    position: 160,
    active: true, // live since the national launch
  },
];
