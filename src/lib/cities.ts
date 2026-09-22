import type { DeliveryZone } from "@prisma/client";
import { resolveZoneFrom } from "@/lib/zones";

/**
 * Cities we talk about on the storefront's delivery pages.
 *
 * Nothing here decides price or eligibility — that is always the postal code
 * routed through the delivery zones (src/lib/zones.ts). A city entry only says
 * "this is a place people search for", carries the copy we wrote about it, and
 * names a representative FSA so the page can look up what checkout would
 * actually quote there. If the owner edits a zone in admin, every city page
 * follows on the next render; there is no second copy of fees or cutoffs.
 *
 * Only cities with `page: true` get their own URL. A page per suburb with the
 * same text and a swapped name is the doorway-page pattern search engines
 * demote, so the list is short and each intro is written for that place.
 */
export type City = {
  slug: string;
  name: { en: string; fr: string };
  /** Regional label shown under the city name. */
  region: { en: string; fr: string };
  /** FSAs (first three postal characters) the city is made of, for the "areas we cover" list. */
  fsas: string[];
  /** The FSA used to ask the zones what checkout offers here. */
  sampleFsa: string;
  /** Neighbourhoods and districts, in the language people use locally. */
  areas: { en: string[]; fr: string[] };
  intro: { en: string; fr: string };
  page: boolean;
};

export const CITIES: City[] = [
  {
    slug: "mississauga",
    name: { en: "Mississauga", fr: "Mississauga" },
    region: { en: "Our home city", fr: "Notre ville" },
    fsas: ["L4T", "L4V", "L4W", "L4X", "L4Y", "L4Z", "L5A", "L5B", "L5C", "L5E", "L5G", "L5H", "L5J", "L5K", "L5L", "L5M", "L5N", "L5P", "L5R", "L5S", "L5T", "L5V", "L5W"],
    sampleFsa: "L5B",
    areas: {
      en: ["City Centre / Square One", "Port Credit", "Streetsville", "Erin Mills", "Meadowvale", "Clarkson", "Lakeview", "Cooksville", "Malton", "Churchill Meadows", "Lisgar", "Heartland"],
      fr: ["Centre-ville / Square One", "Port Credit", "Streetsville", "Erin Mills", "Meadowvale", "Clarkson", "Lakeview", "Cooksville", "Malton", "Churchill Meadows", "Lisgar", "Heartland"],
    },
    intro: {
      en: "Velvéa is composed in Mississauga, a few minutes from Square One, so this is the city we know street by street. Baskets ordered before the cutoff leave the studio the same afternoon and are handed over in person, whether that is a condo lobby in City Centre, a porch in Streetsville or an office in the Heartland business parks. It is also the only city where you can skip delivery altogether and collect your order from us.",
      fr: "Velvéa est composée à Mississauga, à quelques minutes de Square One : c'est la ville que nous connaissons rue par rue. Les paniers commandés avant l'heure limite quittent l'atelier l'après-midi même et sont remis en main propre, que ce soit dans le hall d'un condo au centre-ville, sur un perron à Streetsville ou dans un bureau du parc d'affaires Heartland. C'est aussi la seule ville où vous pouvez éviter la livraison et venir récupérer votre commande.",
    },
    page: true,
  },
  {
    slug: "toronto",
    name: { en: "Toronto", fr: "Toronto" },
    region: { en: "Including Etobicoke, North York and Scarborough", fr: "Y compris Etobicoke, North York et Scarborough" },
    fsas: ["M1", "M2", "M3", "M4", "M5", "M6", "M8", "M9"],
    sampleFsa: "M5V",
    areas: {
      en: ["Downtown and the Financial District", "Etobicoke", "North York", "Scarborough", "East York", "The Beaches", "Leslieville", "Liberty Village", "Yorkville", "The Annex", "High Park", "Midtown"],
      fr: ["Centre-ville et quartier financier", "Etobicoke", "North York", "Scarborough", "East York", "The Beaches", "Leslieville", "Liberty Village", "Yorkville", "The Annex", "High Park", "Midtown"],
    },
    intro: {
      en: "Every Toronto postal code, from Etobicoke to Scarborough, is covered by our own drivers rather than a courier, which is what makes same-day possible for a gift that has to arrive today. Downtown condo deliveries are left with the concierge and confirmed to you by message; office gifts are timed for business hours. The cutoff is earlier than in Mississauga because of the drive, so morning orders are the safest bet.",
      fr: "Chaque code postal de Toronto, d'Etobicoke à Scarborough, est desservi par nos propres livreurs plutôt que par un transporteur, ce qui rend possible la livraison le jour même d'un cadeau qui doit arriver aujourd'hui. Les livraisons en condo au centre-ville sont remises au concierge et confirmées par message ; les cadeaux au bureau sont livrés pendant les heures ouvrables. L'heure limite est plus tôt qu'à Mississauga à cause du trajet : les commandes du matin sont les plus sûres.",
    },
    page: true,
  },
  {
    slug: "brampton",
    name: { en: "Brampton", fr: "Brampton" },
    region: { en: "Peel Region", fr: "Région de Peel" },
    fsas: ["L6P", "L6R", "L6S", "L6T", "L6V", "L6W", "L6X", "L6Y", "L6Z", "L7A"],
    sampleFsa: "L6Y",
    areas: {
      en: ["Downtown Brampton", "Bramalea", "Mount Pleasant", "Springdale", "Heart Lake", "Castlemore", "Fletcher's Meadow", "Sandringham-Wellington", "Northwest Brampton"],
      fr: ["Centre-ville de Brampton", "Bramalea", "Mount Pleasant", "Springdale", "Heart Lake", "Castlemore", "Fletcher's Meadow", "Sandringham-Wellington", "Nord-Ouest de Brampton"],
    },
    intro: {
      en: "Brampton is fifteen minutes up Hurontario from the studio, close enough that we treat it almost like home turf. Many of our Brampton orders are family gifts, new-baby baskets and Thanksgiving hampers sent between relatives across Peel, and a good share are sent by people who have moved away and want something delivered to parents still in Springdale or Bramalea. Same-day is available across every Brampton postal code.",
      fr: "Brampton est à quinze minutes de l'atelier en remontant Hurontario, assez près pour que nous la traitions presque comme notre propre quartier. Beaucoup de nos commandes pour Brampton sont des cadeaux familiaux, des paniers de naissance et des paniers d'Action de grâce échangés entre proches dans Peel, et bon nombre viennent de gens partis vivre ailleurs qui veulent faire livrer quelque chose à leurs parents restés à Springdale ou à Bramalea. La livraison le jour même est offerte dans tous les codes postaux de Brampton.",
    },
    page: true,
  },
  {
    slug: "oakville",
    name: { en: "Oakville", fr: "Oakville" },
    region: { en: "Halton Region", fr: "Région de Halton" },
    fsas: ["L6H", "L6J", "L6K", "L6L", "L6M"],
    sampleFsa: "L6H",
    areas: {
      en: ["Downtown Oakville and Kerr Village", "Bronte", "Glen Abbey", "River Oaks", "Joshua Creek", "Uptown Core", "Clearview", "Palermo"],
      fr: ["Centre-ville d'Oakville et Kerr Village", "Bronte", "Glen Abbey", "River Oaks", "Joshua Creek", "Uptown Core", "Clearview", "Palermo"],
    },
    intro: {
      en: "Oakville orders lean towards the considered end of our range: spa and wellness baskets, coffee and tea hampers and corporate thank-yous for the firms along the QEW. We deliver to the whole town, from the lakefront in Bronte and downtown to the newer streets north of Dundas, and same-day is available when you order before the cutoff.",
      fr: "Les commandes d'Oakville penchent vers le côté raffiné de notre gamme : paniers spa et bien-être, paniers café et thé et remerciements d'entreprise pour les firmes le long de la QEW. Nous livrons dans toute la ville, du bord du lac à Bronte et au centre-ville jusqu'aux nouvelles rues au nord de Dundas, et la livraison le jour même est offerte si vous commandez avant l'heure limite.",
    },
    page: true,
  },
  {
    slug: "milton",
    name: { en: "Milton", fr: "Milton" },
    region: { en: "Halton Region", fr: "Région de Halton" },
    fsas: ["L9T", "L9E"],
    sampleFsa: "L9T",
    areas: {
      en: ["Old Milton", "Beaty", "Clarke", "Dempsey", "Harrison", "Scott", "Willmott", "Ford", "Cobban"],
      fr: ["Vieux Milton", "Beaty", "Clarke", "Dempsey", "Harrison", "Scott", "Willmott", "Ford", "Cobban"],
    },
    intro: {
      en: "Milton has grown faster than almost anywhere in Canada, and a lot of our Milton gifts are housewarmings and new-baby baskets for people who have just arrived. We reach every part of town, including the newer neighbourhoods south of Derry, on the same day when you order before the cutoff.",
      fr: "Milton a grandi plus vite que presque partout au Canada, et beaucoup de nos cadeaux pour Milton sont des paniers de pendaison de crémaillère et de naissance pour des gens tout juste arrivés. Nous desservons toute la ville, y compris les nouveaux quartiers au sud de Derry, le jour même si vous commandez avant l'heure limite.",
    },
    page: true,
  },
  {
    slug: "vaughan",
    name: { en: "Vaughan", fr: "Vaughan" },
    region: { en: "York Region", fr: "Région de York" },
    fsas: ["L4H", "L4J", "L4K", "L4L", "L6A"],
    sampleFsa: "L4K",
    areas: {
      en: ["Woodbridge", "Thornhill", "Maple", "Kleinburg", "Concord", "Vaughan Metropolitan Centre"],
      fr: ["Woodbridge", "Thornhill", "Maple", "Kleinburg", "Concord", "Vaughan Metropolitan Centre"],
    },
    intro: {
      en: "Vaughan deliveries run up the 400 and 427 to Woodbridge, Maple, Thornhill and Kleinburg. Gourmet and chocolate baskets are the local favourites, and a good number go to the head offices around the Vaughan Metropolitan Centre. Same-day is available across the city when you order before the cutoff.",
      fr: "Les livraisons à Vaughan remontent la 400 et la 427 vers Woodbridge, Maple, Thornhill et Kleinburg. Les paniers gourmet et chocolat sont les favoris locaux, et bon nombre vont aux sièges sociaux autour du Vaughan Metropolitan Centre. La livraison le jour même est offerte dans toute la ville si vous commandez avant l'heure limite.",
    },
    page: true,
  },
  {
    slug: "markham",
    name: { en: "Markham", fr: "Markham" },
    region: { en: "York Region", fr: "Région de York" },
    fsas: ["L3P", "L3R", "L3S", "L3T", "L6B", "L6C", "L6E", "L6G"],
    sampleFsa: "L3R",
    areas: {
      en: ["Unionville", "Markham Village", "Milliken", "Cornell", "Berczy", "Thornhill (Markham side)", "Cachet", "Wismer"],
      fr: ["Unionville", "Markham Village", "Milliken", "Cornell", "Berczy", "Thornhill (côté Markham)", "Cachet", "Wismer"],
    },
    intro: {
      en: "Markham is the far edge of our same-day range, from Unionville and Markham Village to Cornell and Milliken. Because of the drive across the top of the city, the cutoff is earlier than in Mississauga: order in the morning for same-day, or choose a date for next-day delivery at the standard local rate.",
      fr: "Markham est la limite de notre zone de livraison le jour même, d'Unionville et Markham Village jusqu'à Cornell et Milliken. En raison du trajet à travers le nord de la ville, l'heure limite est plus tôt qu'à Mississauga : commandez le matin pour le jour même, ou choisissez une date pour une livraison le lendemain au tarif local habituel.",
    },
    page: true,
  },
  {
    slug: "richmond-hill",
    name: { en: "Richmond Hill", fr: "Richmond Hill" },
    region: { en: "York Region", fr: "Région de York" },
    fsas: ["L4B", "L4C", "L4E", "L4S"],
    sampleFsa: "L4C",
    areas: {
      en: ["Downtown Richmond Hill", "Oak Ridges", "Bayview Hill", "Mill Pond", "Jefferson", "Langstaff"],
      fr: ["Centre-ville de Richmond Hill", "Oak Ridges", "Bayview Hill", "Mill Pond", "Jefferson", "Langstaff"],
    },
    intro: {
      en: "Richmond Hill sits at the top of our same-day map, reached by Highway 7 or the 404 through Thornhill. Deliveries to Oak Ridges and Jefferson are timed with the York Region run so a single trip covers the area, which is why the cutoff here is the early one. Next-day delivery is always available if you miss it.",
      fr: "Richmond Hill est au sommet de notre carte de livraison le jour même, atteinte par la route 7 ou la 404 via Thornhill. Les livraisons à Oak Ridges et Jefferson sont regroupées avec la tournée de York afin qu'un seul trajet couvre le secteur, d'où l'heure limite plus tôt. La livraison le lendemain est toujours possible si vous la manquez.",
    },
    page: true,
  },
  {
    slug: "burlington",
    name: { en: "Burlington", fr: "Burlington" },
    region: { en: "Halton Region", fr: "Région de Halton" },
    fsas: ["L7L", "L7M", "L7N", "L7P", "L7R", "L7S", "L7T"],
    sampleFsa: "L7L",
    areas: {
      en: ["Downtown Burlington and Spencer Smith Park", "Aldershot", "Millcroft", "Orchard", "Alton Village", "Tyandaga", "Roseland", "Headon Forest"],
      fr: ["Centre-ville de Burlington et Spencer Smith Park", "Aldershot", "Millcroft", "Orchard", "Alton Village", "Tyandaga", "Roseland", "Headon Forest"],
    },
    intro: {
      en: "Burlington is the western end of our local delivery, a straight run down the QEW past Oakville. We deliver across the city from Aldershot to the Orchard and up to Alton Village. Whether same-day is offered on a given day depends on the delivery zone your postal code falls in, and the exact options and cost show at checkout the moment you enter it.",
      fr: "Burlington est l'extrémité ouest de notre livraison locale, tout droit par la QEW après Oakville. Nous livrons dans toute la ville, d'Aldershot à l'Orchard et jusqu'à Alton Village. L'offre du jour même dépend de la zone de livraison de votre code postal, et les options exactes et leur coût s'affichent au paiement dès que vous l'entrez.",
    },
    page: true,
  },
  {
    slug: "georgetown",
    name: { en: "Georgetown", fr: "Georgetown" },
    region: { en: "Halton Hills", fr: "Halton Hills" },
    fsas: ["L7G"],
    sampleFsa: "L7G",
    areas: {
      en: ["Downtown Georgetown", "Georgetown South", "Glen Williams", "Delrex", "Moore Park"],
      fr: ["Centre-ville de Georgetown", "Georgetown South", "Glen Williams", "Delrex", "Moore Park"],
    },
    intro: {
      en: "Georgetown is closer to the studio than much of Toronto, out along Highway 401 and Trafalgar through the Halton Hills. We deliver to the town itself and to Glen Williams, and gifts here tend to be the homely kind: sympathy baskets, get-well hampers and thank-yous for neighbours. The options and price for your exact postal code appear at checkout.",
      fr: "Georgetown est plus près de l'atelier qu'une bonne partie de Toronto, par la 401 et Trafalgar à travers les collines de Halton. Nous livrons dans la ville même et à Glen Williams, et les cadeaux ici sont souvent du genre chaleureux : paniers de sympathie, paniers de prompt rétablissement et remerciements entre voisins. Les options et le prix pour votre code postal exact s'affichent au paiement.",
    },
    page: true,
  },
  {
    slug: "bolton",
    name: { en: "Bolton", fr: "Bolton" },
    region: { en: "Caledon", fr: "Caledon" },
    fsas: ["L7E"],
    sampleFsa: "L7E",
    areas: {
      en: ["Bolton village", "Bolton North Hill", "Bolton South Hill", "Palgrave", "Caledon East"],
      fr: ["Village de Bolton", "Bolton North Hill", "Bolton South Hill", "Palgrave", "Caledon East"],
    },
    intro: {
      en: "Bolton is our northernmost regular stop, reached up Highway 50 past Brampton. It is a small town with a strong gift-giving habit around Christmas, Mother's Day and new arrivals, and we are glad to bring baskets out to it. Enter your postal code at checkout to see whether same-day or next-day applies and what it costs.",
      fr: "Bolton est notre arrêt régulier le plus au nord, par la route 50 après Brampton. C'est une petite ville où l'on offre volontiers des cadeaux à Noël, à la fête des Mères et pour les naissances, et nous sommes heureux d'y apporter nos paniers. Entrez votre code postal au paiement pour voir si le jour même ou le lendemain s'applique et à quel prix.",
    },
    page: true,
  },
  // Listed on the hub only. Each gets a page the day it earns one.
  { slug: "hamilton", name: { en: "Hamilton", fr: "Hamilton" }, region: { en: "Hamilton", fr: "Hamilton" }, fsas: ["L8", "L9A", "L9B", "L9C", "L9G", "L9H", "L9K"], sampleFsa: "L8P", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "pickering", name: { en: "Pickering", fr: "Pickering" }, region: { en: "Durham Region", fr: "Région de Durham" }, fsas: ["L1V", "L1W", "L1X", "L1Y"], sampleFsa: "L1V", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "ajax", name: { en: "Ajax", fr: "Ajax" }, region: { en: "Durham Region", fr: "Région de Durham" }, fsas: ["L1S", "L1T", "L1Z"], sampleFsa: "L1S", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "whitby", name: { en: "Whitby", fr: "Whitby" }, region: { en: "Durham Region", fr: "Région de Durham" }, fsas: ["L1M", "L1N", "L1P", "L1R"], sampleFsa: "L1N", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "oshawa", name: { en: "Oshawa", fr: "Oshawa" }, region: { en: "Durham Region", fr: "Région de Durham" }, fsas: ["L1G", "L1H", "L1J", "L1K", "L1L"], sampleFsa: "L1H", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "newmarket", name: { en: "Newmarket", fr: "Newmarket" }, region: { en: "York Region", fr: "Région de York" }, fsas: ["L3X", "L3Y"], sampleFsa: "L3Y", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "aurora", name: { en: "Aurora", fr: "Aurora" }, region: { en: "York Region", fr: "Région de York" }, fsas: ["L4G"], sampleFsa: "L4G", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "stouffville", name: { en: "Stouffville", fr: "Stouffville" }, region: { en: "York Region", fr: "Région de York" }, fsas: ["L4A"], sampleFsa: "L4A", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "king-city", name: { en: "King City", fr: "King City" }, region: { en: "York Region", fr: "Région de York" }, fsas: ["L7B"], sampleFsa: "L7B", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "guelph", name: { en: "Guelph", fr: "Guelph" }, region: { en: "Wellington County", fr: "Comté de Wellington" }, fsas: ["N1"], sampleFsa: "N1G", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
  { slug: "orangeville", name: { en: "Orangeville", fr: "Orangeville" }, region: { en: "Dufferin County", fr: "Comté de Dufferin" }, fsas: ["L9W"], sampleFsa: "L9W", areas: { en: [], fr: [] }, intro: { en: "", fr: "" }, page: false },
];

export const CITY_PAGES = CITIES.filter((c) => c.page);

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** What checkout would offer at this city's representative postal code. */
export type CityOffer =
  | { kind: "same-day"; zone: DeliveryZone; cutoff: string }
  | { kind: "next-day"; zone: DeliveryZone }
  | { kind: "shipping"; zone: DeliveryZone }
  | { kind: "quote" }
  | { kind: "unserved" };

export function offerFor(city: City, zones: DeliveryZone[]): CityOffer {
  const match = resolveZoneFrom(zones, city.sampleFsa);
  if (!match.ok) return { kind: match.reason === "quote" ? "quote" : "unserved" };
  const { zone } = match;
  if (zone.kind === "LOCAL") {
    return zone.sameDayCutoff ? { kind: "same-day", zone, cutoff: zone.sameDayCutoff } : { kind: "next-day", zone };
  }
  return { kind: "shipping", zone };
}

/** "16:00" → "4:00 p.m." in English, "16 h" in French. Store time is Eastern. */
export function formatCutoff(hhmm: string, locale: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h)) return hhmm;
  if (locale === "fr") return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
  const suffix = h >= 12 ? "p.m." : "a.m.";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}
