/**
 * Editorial content for the occasion pages people actually search for
 * ("christmas hampers mississauga", "birthday gift hamper same day toronto",
 * "wedding hampers brampton"). Each entry gives the collection page a real
 * introduction, a short FAQ (rendered and emitted as FAQPage JSON-LD) and a
 * fallback meta title/description. A stored seoTitle/seoDescription on the
 * collection in admin still wins over the fallback here.
 *
 * Why in code and not the database: the copy quotes the same-day cutoff, the
 * local fee and the list of same-day cities, and those must follow the
 * delivery zones. `{cutoff}`, `{fee}` and `{cities}` are filled at render time
 * from the resolved Mississauga zone (see `occasionFacts`), so an admin zone
 * edit changes every occasion page at once. Entries that need a same-day
 * promise are marked `needs: "same-day"` and are dropped when the zone has no
 * cutoff, rather than published with a blank.
 *
 * The one page per occasion is the right unit. City-by-occasion pages
 * ("christmas hampers brampton") with swapped names are the doorway pattern
 * Google demotes; the city link rail on each occasion page and the occasion
 * section on each city page carry those combinations instead.
 */

export type Lang = { en: string; fr: string };

export type OccasionFaq = {
  q: Lang;
  a: Lang;
  /** Only shown while the Mississauga zone offers same-day (the answer quotes the cutoff). */
  needs?: "same-day";
};

export type OccasionSeo = {
  /** OCCASION collection slug (`OCCASIONS` / `HOLIDAYS` in nav.ts). */
  slug: string;
  /** Meta title fallback (unbranded; the layout appends " · Velvéa"). */
  title: Lang;
  /** Meta description fallback. */
  description: Lang;
  /** Heading of the editorial block under the product grid. */
  heading: Lang;
  intro: { en: string[]; fr: string[] };
  faq: OccasionFaq[];
};

/** Formatted facts the placeholders are filled from. All optional: a missing one leaves the sentence out. */
export type OccasionFacts = {
  /** "12:00 p.m." / "12 h" */
  cutoff?: string;
  /** "$9.99" / "9,99 $" */
  fee?: string;
  /** "Mississauga, Toronto, Etobicoke … and Richmond Hill" */
  cities: string;
};

const CUTOFF_HINT = "{cutoff}";

export function fillOccasion(text: string, facts: OccasionFacts): string {
  return text
    .replace(/\{cutoff\}/g, facts.cutoff ?? "")
    .replace(/\{fee\}/g, facts.fee ?? "")
    .replace(/\{cities\}/g, facts.cities);
}

export function occasionSeo(slug: string): OccasionSeo | undefined {
  return OCCASION_SEO.find((o) => o.slug === slug);
}

/** Paragraphs for a locale with the facts filled in; a paragraph that needs a cutoff is dropped when there is none. */
export function resolveOccasionIntro(entry: OccasionSeo, locale: string, facts: OccasionFacts): string[] {
  const list = locale === "fr" ? entry.intro.fr : entry.intro.en;
  return list.filter((p) => facts.cutoff || !p.includes(CUTOFF_HINT)).map((p) => fillOccasion(p, facts));
}

export function resolveOccasionFaq(entry: OccasionSeo, locale: string, facts: OccasionFacts): { q: string; a: string }[] {
  const fr = locale === "fr";
  return entry.faq
    .filter((f) => f.needs !== "same-day" || Boolean(facts.cutoff))
    .map((f) => ({ q: fillOccasion(fr ? f.q.fr : f.q.en, facts), a: fillOccasion(fr ? f.a.fr : f.a.en, facts) }));
}

/** "A, B, C and D" / "A, B, C et D". */
export function joinNames(names: string[], locale: string): string {
  if (names.length <= 1) return names.join("");
  const last = names[names.length - 1];
  return `${names.slice(0, -1).join(", ")} ${locale === "fr" ? "et" : "and"} ${last}`;
}

export const OCCASION_SEO: OccasionSeo[] = [
  {
    slug: "christmas",
    title: {
      en: "Christmas Hampers & Gift Baskets, Same-Day in Mississauga & the GTA",
      fr: "Paniers de Noël et paniers-cadeaux, le jour même à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Christmas hampers and gift baskets packed by hand in Mississauga. Same-day delivery across Mississauga, Brampton, Toronto, Etobicoke, Oakville and Milton; tracked shipping across Canada. Alcohol-free.",
      fr: "Paniers de Noël et paniers-cadeaux emballés à la main à Mississauga. Livraison le jour même à Mississauga, Brampton, Toronto, Etobicoke, Oakville et Milton; expédition suivie partout au Canada. Sans alcool.",
    },
    heading: {
      en: "Christmas hampers, delivered across Mississauga and the GTA",
      fr: "Paniers de Noël livrés à Mississauga et dans le Grand Toronto",
    },
    intro: {
      en: [
        "A Christmas hamper is the one gift that works for everyone on the list: the family you are visiting, the neighbour who took in your parcels, the client who stuck with you, the team that got you through December. Ours are packed by hand in Mississauga after you order, with chocolate, coffee, savoury snacks, sweets and self-care products from brands people already know, in a box or basket that looks right under a tree. None of them contain alcohol, so a hamper can go to any colleague, client or household without a second thought.",
        "Local orders go out with our own drivers: order before {cutoff} and a Christmas hamper is delivered the same day in {cities}, or pick a December date at checkout. Baskets that travel well ship by tracked courier to the rest of Ontario, the Prairies, British Columbia and Atlantic Canada, so a hamper can reach family across the country. The dates still open are shown at checkout; December fills up, and an early order gets the day you want.",
      ],
      fr: [
        "Le panier de Noël est le cadeau qui convient à tout le monde sur la liste : la famille chez qui vous passez les fêtes, le voisin qui a gardé vos colis, le client fidèle, l'équipe qui vous a fait traverser décembre. Les nôtres sont emballés à la main à Mississauga après votre commande, avec du chocolat, du café, des collations salées, des sucreries et des produits de soin de marques que les gens connaissent déjà, dans une boîte ou un panier qui a sa place sous le sapin. Aucun ne contient d'alcool : un panier peut donc aller à n'importe quel collègue, client ou foyer sans hésitation.",
        "Les commandes locales partent avec nos propres livreurs : commandez avant {cutoff} et un panier de Noël est livré le jour même à {cities}, ou choisissez une date de décembre à la caisse. Les paniers qui voyagent bien sont expédiés par transporteur avec suivi dans le reste de l'Ontario, les Prairies, la Colombie-Britannique et les provinces de l'Atlantique, pour rejoindre la famille partout au pays. Les dates encore ouvertes s'affichent à la caisse; décembre se remplit vite, et une commande hâtive obtient le jour voulu.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Can I get a Christmas hamper delivered today in Mississauga or the GTA?", fr: "Puis-je faire livrer un panier de Noël aujourd'hui à Mississauga ou dans le Grand Toronto ?" },
        a: {
          en: "Yes. Order before {cutoff} Eastern and we deliver the same day in {cities}. After the cutoff, choose the next open date at checkout.",
          fr: "Oui. Commandez avant {cutoff} (heure de l'Est) et nous livrons le jour même à {cities}. Après l'heure limite, choisissez la prochaine date ouverte à la caisse.",
        },
      },
      {
        q: { en: "When should I order a Christmas hamper for delivery across Canada?", fr: "Quand commander un panier de Noël pour une livraison ailleurs au Canada ?" },
        a: {
          en: "Courier shipping takes two to six business days depending on the province, and the couriers get busier as Christmas gets closer. Order by the second week of December to be safe; the date picker at checkout shows what is still possible for the recipient's postal code.",
          fr: "L'expédition par transporteur prend de deux à six jours ouvrables selon la province, et les transporteurs sont de plus en plus occupés à l'approche de Noël. Commandez avant la deuxième semaine de décembre pour être tranquille; le sélecteur de date à la caisse montre ce qui est encore possible pour le code postal du destinataire.",
        },
      },
      {
        q: { en: "Do your Christmas hampers contain alcohol?", fr: "Vos paniers de Noël contiennent-ils de l'alcool ?" },
        a: {
          en: "No. Every Velvéa hamper is alcohol-free, and each basket's page lists exactly what is inside, so you can check for nuts, dairy or gelatine before you send it.",
          fr: "Non. Chaque panier Velvéa est sans alcool, et la page de chaque panier indique exactement ce qu'il contient, pour vérifier la présence de noix, de produits laitiers ou de gélatine avant de l'envoyer.",
        },
      },
      {
        q: { en: "Can I send Christmas hampers to a whole team or client list?", fr: "Puis-je envoyer des paniers de Noël à toute une équipe ou à une liste de clients ?" },
        a: {
          en: "Yes. Online orders hold up to ten baskets. For more, or for different addresses with a card for each person, request a corporate quote and we reply within one business day with pricing and delivery dates.",
          fr: "Oui. Une commande en ligne peut contenir jusqu'à dix paniers. Pour davantage, ou pour plusieurs adresses avec une carte pour chaque personne, demandez un devis d'entreprise : nous répondons sous un jour ouvrable avec les prix et les dates de livraison.",
        },
      },
    ],
  },
  {
    slug: "holiday",
    title: {
      en: "Holiday Gift Hampers & Baskets, Delivered in Mississauga & the GTA",
      fr: "Paniers-cadeaux du temps des fêtes, livrés à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Holiday gift hampers and baskets for family, friends, clients and teams, packed by hand in Mississauga. Same-day delivery in the GTA, tracked shipping across Canada. Alcohol-free.",
      fr: "Paniers-cadeaux du temps des fêtes pour la famille, les amis, les clients et les équipes, emballés à la main à Mississauga. Livraison le jour même dans le Grand Toronto, expédition suivie partout au Canada. Sans alcool.",
    },
    heading: { en: "Holiday hampers for the whole season", fr: "Des paniers pour toute la saison des fêtes" },
    intro: {
      en: [
        "The holiday season runs from Diwali and Thanksgiving through Christmas, Hanukkah and New Year, and this collection holds every basket that suits it: gourmet and chocolate hampers to share, coffee and tea boxes for a quiet morning, spa baskets for someone who needs a rest after hosting. Everything is alcohol-free, which keeps the choice simple for mixed teams and families.",
        "We pack each basket after you order and deliver locally with our own drivers, same day in {cities} when you order before {cutoff}. Courier shipping reaches the rest of Canada in a few business days. For an office or a client list, the corporate page explains volume pricing, branded cards and delivery to many addresses.",
      ],
      fr: [
        "La saison des fêtes va de Diwali et de l'Action de grâce jusqu'à Noël, Hanoukka et le Nouvel An, et cette collection réunit tous les paniers qui lui conviennent : paniers gourmet et chocolat à partager, coffrets café et thé pour un matin tranquille, paniers spa pour la personne qui a besoin de souffler après avoir reçu. Tout est sans alcool, ce qui simplifie le choix pour les équipes et les familles.",
        "Nous emballons chaque panier après votre commande et livrons localement avec nos propres livreurs, le jour même à {cities} si vous commandez avant {cutoff}. L'expédition par transporteur rejoint le reste du Canada en quelques jours ouvrables. Pour un bureau ou une liste de clients, la page entreprise explique les prix de volume, les cartes à votre image et la livraison à plusieurs adresses.",
      ],
    },
    faq: [
      {
        q: { en: "What is the difference between the Holiday and Christmas collections?", fr: "Quelle est la différence entre les collections Temps des fêtes et Noël ?" },
        a: {
          en: "Christmas holds the baskets styled for Christmas itself. Holiday is wider: anything that suits the season from November to the New Year, including gifts for people who do not celebrate Christmas.",
          fr: "Noël regroupe les paniers conçus pour Noël même. Temps des fêtes est plus large : tout ce qui convient à la saison, de novembre au Nouvel An, y compris des cadeaux pour ceux qui ne célèbrent pas Noël.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Can I choose the delivery date for a holiday hamper?", fr: "Puis-je choisir la date de livraison d'un panier des fêtes ?" },
        a: {
          en: "Yes. Checkout shows the open dates for the recipient's postal code, so you can order now and have the basket delivered the week you want. Same-day is available in {cities} before {cutoff}.",
          fr: "Oui. La caisse affiche les dates ouvertes pour le code postal du destinataire : vous pouvez commander maintenant et faire livrer le panier la semaine voulue. Le jour même est offert à {cities} avant {cutoff}.",
        },
      },
      {
        q: { en: "Do you deliver holiday hampers to offices?", fr: "Livrez-vous des paniers des fêtes dans les bureaux ?" },
        a: {
          en: "Yes. Add the business hours to the delivery notes and we time the drop for them. Reception or a concierge can sign for it, and you get an email when it is delivered.",
          fr: "Oui. Indiquez les heures d'ouverture dans les notes de livraison et nous planifions le passage en conséquence. La réception ou le concierge peut le recevoir, et vous recevez un courriel à la livraison.",
        },
      },
    ],
  },
  {
    slug: "birthday",
    title: {
      en: "Birthday Gift Hampers & Baskets, Same-Day in Mississauga & the GTA",
      fr: "Paniers-cadeaux d'anniversaire, le jour même à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Birthday gift hampers and baskets packed by hand in Mississauga: chocolate, gourmet, spa and coffee gifts. Same-day delivery across the GTA, tracked shipping across Canada.",
      fr: "Paniers-cadeaux d'anniversaire emballés à la main à Mississauga : chocolat, gourmet, spa et café. Livraison le jour même dans le Grand Toronto, expédition suivie partout au Canada.",
    },
    heading: { en: "Birthday hampers, delivered the same day", fr: "Paniers d'anniversaire livrés le jour même" },
    intro: {
      en: [
        "A birthday hamper solves the oldest gifting problem: what to send someone who says they do not want anything. Ours lean towards treats people will actually open that evening, chocolate, gourmet snacks, good coffee, a bath soak, and arrive with your message printed on a card. There are baskets for him, for her, for a parent, a colleague or a friend, and every one is packed by hand in Mississauga after you order.",
        "Forgot until this morning? Order before {cutoff} and the basket is delivered by hand the same day anywhere in {cities}, by our own driver rather than a courier, so the surprise stays intact. For a birthday further away, courier shipping reaches the rest of Canada in a few business days; order with a little room to spare.",
      ],
      fr: [
        "Le panier d'anniversaire règle le plus vieux problème du cadeau : quoi envoyer à quelqu'un qui dit ne rien vouloir. Les nôtres misent sur des gâteries qu'on ouvre le soir même, du chocolat, des collations gourmet, un bon café, un bain moussant, et arrivent avec votre message imprimé sur une carte. Il y a des paniers pour lui, pour elle, pour un parent, un collègue ou un ami, et chacun est emballé à la main à Mississauga après votre commande.",
        "Oublié jusqu'à ce matin ? Commandez avant {cutoff} et le panier est remis en main propre le jour même partout à {cities}, par notre propre livreur plutôt qu'un transporteur, pour garder la surprise intacte. Pour un anniversaire plus loin, l'expédition par transporteur rejoint le reste du Canada en quelques jours ouvrables; commandez avec un peu de marge.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Can I get a birthday hamper delivered today?", fr: "Puis-je faire livrer un panier d'anniversaire aujourd'hui ?" },
        a: {
          en: "In {cities}, yes: order before {cutoff} Eastern and one of our drivers delivers it the same day. Weekday same-day orders arrive in the evening; on weekends we deliver through the day.",
          fr: "À {cities}, oui : commandez avant {cutoff} (heure de l'Est) et l'un de nos livreurs l'apporte le jour même. En semaine, les commandes du jour même arrivent en soirée; la fin de semaine, nous livrons tout au long de la journée.",
        },
      },
      {
        q: { en: "Will the price show on the gift?", fr: "Le prix apparaît-il sur le cadeau ?" },
        a: {
          en: "No. Nothing in the basket shows a price. Your message is printed on a card and tucked inside, and the recipient only sees your name if you put it in the message.",
          fr: "Non. Rien dans le panier n'indique de prix. Votre message est imprimé sur une carte glissée à l'intérieur, et le destinataire ne voit votre nom que si vous l'écrivez dans le message.",
        },
      },
      {
        q: { en: "What if the birthday person is not home?", fr: "Et si la personne fêtée n'est pas à la maison ?" },
        a: {
          en: "Same-day orders are delivered in the evening on weekdays, when most people are home. If nobody answers, we follow the delivery notes you left at checkout, and you get an email the moment the basket is delivered.",
          fr: "En semaine, les commandes du jour même sont livrées en soirée, quand la plupart des gens sont à la maison. Si personne ne répond, nous suivons les notes de livraison laissées à la caisse, et vous recevez un courriel dès que le panier est livré.",
        },
      },
    ],
  },
  {
    slug: "anniversary",
    title: {
      en: "Anniversary Gift Hampers & Baskets, Delivered in Mississauga & the GTA",
      fr: "Paniers-cadeaux d'anniversaire de mariage, livrés à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Anniversary gift hampers for your partner or your parents: chocolate, roses, spa and gourmet baskets packed by hand in Mississauga. Same-day in the GTA, shipped across Canada.",
      fr: "Paniers-cadeaux d'anniversaire de mariage pour votre conjoint ou vos parents : chocolat, roses, spa et gourmet, emballés à la main à Mississauga. Le jour même dans le Grand Toronto, expédiés partout au Canada.",
    },
    heading: { en: "Anniversary hampers for a partner, or for the parents", fr: "Paniers d'anniversaire de mariage pour un conjoint, ou pour les parents" },
    intro: {
      en: [
        "Anniversary gifts split two ways. For your own anniversary, the hamper stands in for the evening you may not get to have: chocolate and roses, a self-care basket for two, a gourmet tray to open together. For your parents or a couple you know, a shared hamper of gourmet food and coffee says congratulations without guessing at tastes. The anniversary guide in our journal walks through ideas year by year.",
        "Every basket is composed after you order and delivered by hand in {cities}, same day before {cutoff}, so a forgotten date can still end well. Shippable baskets travel by tracked courier across Canada. Baskets with fresh flowers need extra preparation time, shown on their page, so order those a couple of days ahead.",
      ],
      fr: [
        "Les cadeaux d'anniversaire de mariage se divisent en deux. Pour le vôtre, le panier remplace la soirée que vous n'aurez peut-être pas : chocolat et roses, un panier bien-être pour deux, un plateau gourmet à ouvrir ensemble. Pour vos parents ou un couple que vous connaissez, un panier à partager de produits gourmet et de café dit félicitations sans deviner les goûts. Le guide des anniversaires de mariage dans notre journal propose des idées année par année.",
        "Chaque panier est composé après votre commande et remis en main propre à {cities}, le jour même avant {cutoff}, pour qu'une date oubliée finisse quand même bien. Les paniers expédiables voyagent par transporteur avec suivi partout au Canada. Les paniers avec fleurs fraîches demandent plus de préparation, indiquée sur leur page : commandez-les quelques jours d'avance.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Can an anniversary hamper be delivered the same day?", fr: "Un panier d'anniversaire de mariage peut-il être livré le jour même ?" },
        a: {
          en: "Yes, in {cities}: order before {cutoff} Eastern. Baskets with fresh flowers are the exception; they need two days.",
          fr: "Oui, à {cities} : commandez avant {cutoff} (heure de l'Est). Les paniers avec fleurs fraîches font exception : ils demandent deux jours.",
        },
      },
      {
        q: { en: "Do you have anniversary hampers for a couple rather than one person?", fr: "Avez-vous des paniers d'anniversaire pour un couple plutôt qu'une seule personne ?" },
        a: {
          en: "Yes. The gourmet, chocolate and coffee baskets are built to share, and the message card can be addressed to both. The Couples page gathers them.",
          fr: "Oui. Les paniers gourmet, chocolat et café sont faits pour être partagés, et la carte peut s'adresser aux deux. La page Couples les réunit.",
        },
      },
      {
        q: { en: "Can I add a message?", fr: "Puis-je ajouter un message ?" },
        a: {
          en: "Always. Type it on the product page or at checkout and we print it on a card inside the basket at no charge, or upgrade to a full-size greeting card for a small fee.",
          fr: "Toujours. Écrivez-le sur la page du produit ou à la caisse et nous l'imprimons sans frais sur une carte glissée dans le panier, ou optez pour une carte de vœux grand format pour de modestes frais.",
        },
      },
    ],
  },
  {
    slug: "wedding",
    title: {
      en: "Wedding & Marriage Gift Hampers, Delivered in Mississauga, Brampton & the GTA",
      fr: "Paniers-cadeaux de mariage, livrés à Mississauga, Brampton et dans le Grand Toronto",
    },
    description: {
      en: "Wedding gift hampers and baskets for the couple, the hosts and the wedding party, packed by hand in Mississauga and delivered across the GTA. Alcohol-free, shipped across Canada.",
      fr: "Paniers-cadeaux de mariage pour les mariés, les hôtes et le cortège, emballés à la main à Mississauga et livrés dans le Grand Toronto. Sans alcool, expédiés partout au Canada.",
    },
    heading: { en: "Wedding hampers for the couple, the families and the party", fr: "Paniers de mariage pour les mariés, les familles et le cortège" },
    intro: {
      en: [
        "Wedding hampers are sent for more reasons than the wedding itself: a gift for the couple when you cannot attend, a thank-you to the parents who hosted, welcome baskets for out-of-town guests at the hotel, an engagement or roka gift, a basket for the mehndi or the sangeet, something for the bridal party on the morning of. This collection holds baskets that suit all of those: gourmet trays to share, chocolate and roses, spa baskets for the bride, grooming boxes for the groom.",
        "Everything is alcohol-free, which makes a hamper an easy gift at a mixed or dry wedding, and each basket's page lists exactly what is inside. We deliver by hand in {cities}, same day before {cutoff}, including to hotels and banquet halls, and ship across Canada for the couple who have already moved away.",
      ],
      fr: [
        "On envoie un panier de mariage pour bien plus que le mariage lui-même : un cadeau aux mariés quand on ne peut pas être là, un merci aux parents qui ont reçu, des paniers de bienvenue pour les invités de l'extérieur à l'hôtel, un cadeau de fiançailles ou de roka, un panier pour le mehndi ou le sangeet, une attention pour le cortège le matin même. Cette collection réunit des paniers pour chacune de ces occasions : plateaux gourmet à partager, chocolat et roses, paniers spa pour la mariée, coffrets de toilette pour le marié.",
        "Tout est sans alcool, ce qui fait du panier un cadeau facile pour un mariage mixte ou sans alcool, et la page de chaque panier indique exactement ce qu'il contient. Nous livrons en main propre à {cities}, le jour même avant {cutoff}, y compris dans les hôtels et les salles de réception, et nous expédions partout au Canada pour le couple déjà parti vivre ailleurs.",
      ],
    },
    faq: [
      {
        q: { en: "Can you deliver a wedding gift to the venue or hotel?", fr: "Pouvez-vous livrer un cadeau de mariage à la salle ou à l'hôtel ?" },
        a: {
          en: "Yes. Put the venue or hotel name, the couple's names and the date in the delivery details at checkout. We hand it to reception or the coordinator and email you when it is delivered.",
          fr: "Oui. Indiquez le nom de la salle ou de l'hôtel, les noms des mariés et la date dans les détails de livraison à la caisse. Nous le remettons à la réception ou au coordonnateur et vous envoyons un courriel à la livraison.",
        },
      },
      {
        q: { en: "Do you make hampers for engagements, mehndi, sangeet and other wedding functions?", fr: "Faites-vous des paniers pour les fiançailles, le mehndi, le sangeet et les autres fêtes de mariage ?" },
        a: {
          en: "Yes. Any basket here suits a pre-wedding function, and for a specific theme, colour or set of sweets, the custom basket request lets you describe what you want and we price it by hand.",
          fr: "Oui. Tous les paniers ici conviennent à une fête d'avant-mariage, et pour un thème, une couleur ou des sucreries précises, la demande de panier sur mesure vous permet de décrire ce que vous voulez et nous l'évaluons à la main.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Are wedding hampers available same day?", fr: "Les paniers de mariage sont-ils offerts le jour même ?" },
        a: {
          en: "In {cities}, order before {cutoff} Eastern for same-day delivery. For a hotel welcome basket or a venue delivery, booking a date at checkout a few days ahead is safer.",
          fr: "À {cities}, commandez avant {cutoff} (heure de l'Est) pour une livraison le jour même. Pour un panier de bienvenue à l'hôtel ou une livraison à la salle, réserver une date à la caisse quelques jours d'avance est plus sûr.",
        },
      },
    ],
  },
  {
    slug: "congratulations",
    title: {
      en: "Congratulations Gift Hampers & Baskets, Delivered in Mississauga & the GTA",
      fr: "Paniers-cadeaux de félicitations, livrés à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Congratulations hampers for a new home, a new job, a graduation, a promotion or a family function, packed by hand in Mississauga. Same-day in the GTA, shipped across Canada.",
      fr: "Paniers de félicitations pour une nouvelle maison, un nouvel emploi, un diplôme, une promotion ou une fête de famille, emballés à la main à Mississauga. Le jour même dans le Grand Toronto, expédiés partout au Canada.",
    },
    heading: { en: "Hampers for every celebration and family function", fr: "Des paniers pour chaque célébration et fête de famille" },
    intro: {
      en: [
        "Congratulations covers a lot of ground: a graduation, a new job or promotion, a new home, a baby, an engagement, a retirement, a business opening, a puja or housewarming function with a house full of guests. The baskets here are chosen to be shared, with gourmet snacks, chocolate, sweets and coffee that go round a room, plus a few spa and grooming boxes for a gift to one person.",
        "Order before {cutoff} and the basket is delivered by hand the same day in {cities}; for a function on a set date, pick the day at checkout. Shippable baskets travel across Canada by tracked courier. Nothing we sell contains alcohol, so a hamper is a safe gift for any household.",
      ],
      fr: [
        "Les félicitations couvrent bien des moments : un diplôme, un nouvel emploi ou une promotion, une nouvelle maison, un bébé, des fiançailles, une retraite, l'ouverture d'un commerce, une puja ou une pendaison de crémaillère avec une maison pleine d'invités. Les paniers ici sont choisis pour être partagés, avec des collations gourmet, du chocolat, des sucreries et du café qui font le tour de la pièce, plus quelques coffrets spa et de toilette pour un cadeau à une seule personne.",
        "Commandez avant {cutoff} et le panier est remis en main propre le jour même à {cities}; pour une fête à date fixe, choisissez le jour à la caisse. Les paniers expédiables voyagent partout au Canada par transporteur avec suivi. Rien de ce que nous vendons ne contient d'alcool : un panier est un cadeau sûr pour n'importe quel foyer.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Do you deliver hampers for a function or house party on a specific day?", fr: "Livrez-vous des paniers pour une fête ou une réception à une date précise ?" },
        a: {
          en: "Yes. Choose the date at checkout; local deliveries arrive in the evening on weekdays and through the day on weekends. Same-day is available in {cities} before {cutoff}.",
          fr: "Oui. Choisissez la date à la caisse; les livraisons locales arrivent en soirée en semaine et tout au long de la journée la fin de semaine. Le jour même est offert à {cities} avant {cutoff}.",
        },
      },
      {
        q: { en: "Can I send a congratulations hamper to an office?", fr: "Puis-je envoyer un panier de félicitations à un bureau ?" },
        a: {
          en: "Yes. Add the company name and floor to the address and any business-hours note to the delivery notes, and we time the delivery accordingly.",
          fr: "Oui. Ajoutez le nom de l'entreprise et l'étage à l'adresse, et les heures d'ouverture dans les notes de livraison : nous planifions la livraison en conséquence.",
        },
      },
      {
        q: { en: "What goes in a congratulations hamper?", fr: "Que contient un panier de félicitations ?" },
        a: {
          en: "Mostly things to share: gourmet snacks, chocolate, sweets, coffee or tea, and sometimes a candle or a self-care item for the person being celebrated. Every basket's page lists its contents.",
          fr: "Surtout des choses à partager : collations gourmet, chocolat, sucreries, café ou thé, et parfois une bougie ou un produit de soin pour la personne fêtée. La page de chaque panier indique son contenu.",
        },
      },
    ],
  },
  {
    slug: "housewarming",
    title: {
      en: "Housewarming Gift Hampers & Baskets, Delivered in Mississauga, Milton & the GTA",
      fr: "Paniers-cadeaux de pendaison de crémaillère, livrés à Mississauga, Milton et dans le Grand Toronto",
    },
    description: {
      en: "Housewarming hampers for a new home: gourmet, coffee and chocolate baskets packed by hand in Mississauga, delivered same day across the GTA and shipped across Canada.",
      fr: "Paniers de pendaison de crémaillère pour une nouvelle maison : gourmet, café et chocolat, emballés à la main à Mississauga, livrés le jour même dans le Grand Toronto et expédiés partout au Canada.",
    },
    heading: { en: "Housewarming hampers for a new address", fr: "Paniers de crémaillère pour une nouvelle adresse" },
    intro: {
      en: [
        "A housewarming hamper is the first thing to arrive at a new address that is not a bill. The best ones hold what a kitchen does not have on day one: good coffee or tea, snacks for the unpacking, chocolate for the first evening on the couch. We pack them by hand in Mississauga, and the card can read however you like, from a formal welcome to a joke about the boxes.",
        "Mississauga, Milton, Brampton and Oakville are full of first weeks in new homes, and we deliver to all of them by hand, same day before {cutoff} in {cities}. For friends who moved across the country, shippable baskets go by tracked courier.",
      ],
      fr: [
        "Le panier de crémaillère est la première chose qui arrive à une nouvelle adresse sans être une facture. Les meilleurs contiennent ce qu'une cuisine n'a pas le premier jour : un bon café ou du thé, des collations pour le déballage, du chocolat pour la première soirée sur le canapé. Nous les emballons à la main à Mississauga, et la carte peut dire ce que vous voulez, d'un accueil en bonne et due forme à une blague sur les boîtes.",
        "Mississauga, Milton, Brampton et Oakville sont pleines de premières semaines dans une nouvelle maison, et nous y livrons toutes en main propre, le jour même avant {cutoff} à {cities}. Pour des amis partis à l'autre bout du pays, les paniers expédiables voyagent par transporteur avec suivi.",
      ],
    },
    faq: [
      {
        q: { en: "Can I send a housewarming hamper if I only have the new address?", fr: "Puis-je envoyer un panier de crémaillère si je n'ai que la nouvelle adresse ?" },
        a: {
          en: "Yes. The new address is enough, and a mobile number for the recipient helps if nobody answers the door.",
          fr: "Oui. La nouvelle adresse suffit, et un numéro de cellulaire du destinataire aide si personne ne répond à la porte.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Is same-day delivery available for a housewarming?", fr: "La livraison le jour même est-elle offerte pour une crémaillère ?" },
        a: {
          en: "In {cities}, yes: order before {cutoff} Eastern and the basket is delivered by hand the same day.",
          fr: "À {cities}, oui : commandez avant {cutoff} (heure de l'Est) et le panier est remis en main propre le jour même.",
        },
      },
      {
        q: { en: "Do your housewarming hampers include alcohol?", fr: "Vos paniers de crémaillère contiennent-ils de l'alcool ?" },
        a: {
          en: "No. Every Velvéa basket is alcohol-free, and the contents are listed on each basket's page.",
          fr: "Non. Chaque panier Velvéa est sans alcool, et le contenu est indiqué sur la page de chaque panier.",
        },
      },
    ],
  },
  {
    slug: "just-because",
    title: {
      en: "Surprise Gift Hampers & Baskets, Just Because, in Mississauga & the GTA",
      fr: "Paniers-cadeaux surprise, juste comme ça, à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Surprise someone for no reason at all: gift hampers and baskets packed by hand in Mississauga and delivered the same day across the GTA, or shipped across Canada.",
      fr: "Faites une surprise sans raison : paniers-cadeaux emballés à la main à Mississauga et livrés le jour même dans le Grand Toronto, ou expédiés partout au Canada.",
    },
    heading: { en: "Surprise hampers, for no reason at all", fr: "Paniers surprise, sans aucune raison" },
    intro: {
      en: [
        "The gifts people remember are often the ones with no occasion attached: a hamper that turns up on a Tuesday because someone was thinking of them. This collection is the baskets we would send in that spirit, chocolate, gourmet treats and self-care, with your note printed on a card inside.",
        "Surprises depend on timing, which is why we deliver ourselves. Order before {cutoff} and the basket arrives the same day in {cities}, with the order confirmation and delivery notice sent to you, not to the recipient.",
      ],
      fr: [
        "Les cadeaux dont on se souvient sont souvent ceux sans occasion : un panier qui arrive un mardi parce que quelqu'un pensait à vous. Cette collection réunit les paniers que nous enverrions dans cet esprit, chocolat, gâteries gourmet et soins, avec votre mot imprimé sur une carte à l'intérieur.",
        "Une surprise tient au bon moment, et c'est pourquoi nous livrons nous-mêmes. Commandez avant {cutoff} et le panier arrive le jour même à {cities}, avec la confirmation de commande et l'avis de livraison envoyés à vous, pas au destinataire.",
      ],
    },
    faq: [
      {
        q: { en: "Can I send a surprise hamper anonymously?", fr: "Puis-je envoyer un panier surprise anonymement ?" },
        a: {
          en: "Yes. The card carries only the message you write. Leave your name off and the recipient sees nothing but the message.",
          fr: "Oui. La carte ne porte que le message que vous écrivez. Omettez votre nom et le destinataire ne voit que le message.",
        },
      },
      {
        q: { en: "Will the recipient be told the basket is coming?", fr: "Le destinataire sera-t-il prévenu de l'arrivée du panier ?" },
        a: {
          en: "No. The order confirmation and the delivery notice go to you. Nothing is sent to the recipient before the basket arrives.",
          fr: "Non. La confirmation de commande et l'avis de livraison vous sont envoyés. Rien n'est envoyé au destinataire avant l'arrivée du panier.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Can a surprise hamper be delivered today?", fr: "Un panier surprise peut-il être livré aujourd'hui ?" },
        a: {
          en: "In {cities}, yes: order before {cutoff} Eastern and it is delivered by hand the same day.",
          fr: "À {cities}, oui : commandez avant {cutoff} (heure de l'Est) et il est remis en main propre le jour même.",
        },
      },
    ],
  },
  {
    slug: "milestone-birthday",
    title: {
      en: "Milestone Birthday Gift Baskets, 18th to 90th, in Mississauga & the GTA",
      fr: "Paniers-cadeaux pour anniversaire marquant, de 18 à 90 ans, à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Special birthday gift baskets for the big ones: 18th, 21st, 30th, 40th, 50th, 60th, 70th and beyond. Luxury hampers and crates packed by hand in Mississauga, delivered same day across the GTA.",
      fr: "Paniers-cadeaux pour les grands anniversaires : 18, 21, 30, 40, 50, 60, 70 ans et plus. Paniers et coffrets de luxe emballés à la main à Mississauga, livrés le jour même dans le Grand Toronto.",
    },
    heading: { en: "Special birthdays deserve a bigger basket", fr: "Les anniversaires marquants méritent un plus grand panier" },
    intro: {
      en: [
        "A milestone birthday, the 18th, 21st, 30th, 40th, 50th, 60th, 70th or the one someone pretends is not happening, calls for more than the usual box of treats. This collection is the upper end of our range: the larger gourmet hampers, the luxury beauty and self-care crates, the grooming boxes and the grand chocolate and flower baskets, the ones that make a statement when they are carried into the room. Several are built for a group to give together, and the card can carry everyone's names.",
        "We pack each basket by hand in Mississauga after you order and deliver it ourselves, same day in {cities} before {cutoff}, or on the party date you pick at checkout. Shippable baskets reach the rest of Canada by tracked courier. For a surprise party, add the host's number and a time window in the delivery notes.",
      ],
      fr: [
        "Un anniversaire marquant, 18, 21, 30, 40, 50, 60, 70 ans ou celui qu'on fait semblant d'ignorer, demande plus que la boîte de gâteries habituelle. Cette collection est le haut de notre gamme : les grands paniers gourmet, les coffrets beauté et bien-être de luxe, les coffrets de toilette et les grands paniers de chocolat et de fleurs, ceux qui font de l'effet quand on les apporte dans la pièce. Plusieurs sont pensés pour être offerts à plusieurs, et la carte peut porter tous les noms.",
        "Nous emballons chaque panier à la main à Mississauga après votre commande et le livrons nous-mêmes, le jour même à {cities} avant {cutoff}, ou à la date de la fête choisie à la caisse. Les paniers expédiables rejoignent le reste du Canada par transporteur avec suivi. Pour une fête surprise, ajoutez le numéro de l'hôte et une plage horaire dans les notes de livraison.",
      ],
    },
    faq: [
      {
        q: { en: "What is a good gift for a 50th or 60th birthday?", fr: "Quel cadeau offrir pour un 50e ou un 60e anniversaire ?" },
        a: {
          en: "Something generous and shareable, or something indulgent for the person alone: a large gourmet hamper for the party, a luxury beauty or self-care crate for her, a grooming or gentleman's box for him. The baskets on this page are chosen with those birthdays in mind.",
          fr: "Quelque chose de généreux à partager, ou de franchement gâté pour la personne seule : un grand panier gourmet pour la fête, un coffret beauté ou bien-être de luxe pour elle, un coffret de toilette ou de gentleman pour lui. Les paniers de cette page sont choisis pour ces anniversaires-là.",
        },
      },
      {
        q: { en: "Can several people give one basket together?", fr: "Plusieurs personnes peuvent-elles offrir un seul panier ensemble ?" },
        a: {
          en: "Yes. One person places the order and the card can list everyone's names. For an office collection with many contributors, a corporate quote gives volume pricing and a single invoice.",
          fr: "Oui. Une personne passe la commande et la carte peut porter tous les noms. Pour une collecte au bureau avec de nombreux participants, un devis d'entreprise donne un prix de volume et une seule facture.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Can a milestone birthday basket be delivered today?", fr: "Un panier d'anniversaire marquant peut-il être livré aujourd'hui ?" },
        a: {
          en: "In {cities}, yes: order before {cutoff} Eastern. For a party on a set date, choose the day at checkout.",
          fr: "À {cities}, oui : commandez avant {cutoff} (heure de l'Est). Pour une fête à date fixe, choisissez le jour à la caisse.",
        },
      },
    ],
  },
  {
    slug: "proposal",
    title: {
      en: "Proposal & Engagement Gift Baskets, Same-Day in Mississauga & the GTA",
      fr: "Paniers-cadeaux de demande en mariage et de fiançailles, le jour même à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Proposal and engagement gift baskets: roses, chocolate, spa and gourmet hampers for the question, the yes and the couple who just got engaged. Packed by hand in Mississauga, delivered same day across the GTA.",
      fr: "Paniers-cadeaux de demande en mariage et de fiançailles : roses, chocolat, spa et gourmet pour la question, le oui et le couple qui vient de se fiancer. Emballés à la main à Mississauga, livrés le jour même dans le Grand Toronto.",
    },
    heading: { en: "Proposal and engagement hampers", fr: "Paniers de demande en mariage et de fiançailles" },
    intro: {
      en: [
        "Two kinds of gift live here. One is for the proposal itself: roses and chocolate waiting in the room, a self-care basket for the morning after, something to open together once the answer is yes. The other is for the newly engaged couple, from parents, friends, siblings and colleagues: a shared gourmet tray, chocolate and flowers, a basket for the engagement party or the roka. Each is packed by hand in Mississauga after you order, with your message on a card and no price in sight.",
        "Timing matters more here than anywhere, which is why we deliver ourselves: order before {cutoff} and the basket is delivered the same day in {cities}, to a home, a hotel or a restaurant. Baskets with fresh flowers need two days' notice, shown on their page. Courier shipping reaches a couple elsewhere in Canada.",
      ],
      fr: [
        "Deux sortes de cadeaux se trouvent ici. Le premier est pour la demande elle-même : des roses et du chocolat qui attendent dans la chambre, un panier bien-être pour le lendemain matin, quelque chose à ouvrir ensemble une fois le oui prononcé. Le second est pour le couple nouvellement fiancé, de la part des parents, des amis, des frères et sœurs ou des collègues : un plateau gourmet à partager, du chocolat et des fleurs, un panier pour la fête de fiançailles ou le roka. Chacun est emballé à la main à Mississauga après votre commande, avec votre message sur une carte et aucun prix en vue.",
        "Le moment compte plus ici que partout ailleurs, et c'est pourquoi nous livrons nous-mêmes : commandez avant {cutoff} et le panier est livré le jour même à {cities}, à domicile, à l'hôtel ou au restaurant. Les paniers avec fleurs fraîches demandent deux jours de préavis, indiqués sur leur page. L'expédition par transporteur rejoint un couple ailleurs au Canada.",
      ],
    },
    faq: [
      {
        q: { en: "Can you deliver to a hotel or restaurant for a proposal?", fr: "Pouvez-vous livrer à un hôtel ou à un restaurant pour une demande en mariage ?" },
        a: {
          en: "Yes. Put the venue, the reservation or room name and the time window in the delivery details, and we hand it to the front desk or the host. You get an email when it is delivered, and nothing is sent to the recipient.",
          fr: "Oui. Indiquez l'établissement, le nom de la réservation ou de la chambre et la plage horaire dans les détails de livraison, et nous le remettons à la réception ou à l'hôte. Vous recevez un courriel à la livraison, et rien n'est envoyé au destinataire.",
        },
      },
      {
        q: { en: "Which baskets suit a proposal?", fr: "Quels paniers conviennent à une demande en mariage ?" },
        a: {
          en: "Roses and chocolate for the moment itself, a spa or self-care basket for the morning after, and a gourmet tray to share once the news is out. Each basket's page lists the contents.",
          fr: "Des roses et du chocolat pour le moment même, un panier spa ou bien-être pour le lendemain, et un plateau gourmet à partager une fois la nouvelle annoncée. La page de chaque panier indique le contenu.",
        },
      },
      {
        needs: "same-day",
        q: { en: "Is same-day delivery available for an engagement gift?", fr: "La livraison le jour même est-elle offerte pour un cadeau de fiançailles ?" },
        a: {
          en: "In {cities}, yes: order before {cutoff} Eastern. Baskets with fresh flowers are the exception and need two days.",
          fr: "À {cities}, oui : commandez avant {cutoff} (heure de l'Est). Les paniers avec fleurs fraîches font exception et demandent deux jours.",
        },
      },
    ],
  },
  {
    slug: "real-estate-closing",
    title: {
      en: "Real Estate Closing Gift Baskets for Clients, Mississauga & the GTA",
      fr: "Paniers-cadeaux de clôture immobilière pour vos clients, Mississauga et Grand Toronto",
    },
    description: {
      en: "Closing gift baskets for real estate agents and mortgage brokers: gourmet, coffee and welcome-home hampers packed by hand in Mississauga, delivered to the new address across the GTA on the day you choose.",
      fr: "Paniers-cadeaux de clôture pour courtiers immobiliers et hypothécaires : paniers gourmet, café et bienvenue, emballés à la main à Mississauga et livrés à la nouvelle adresse dans le Grand Toronto, le jour que vous choisissez.",
    },
    heading: { en: "Closing gifts that arrive after the keys", fr: "Des cadeaux de clôture qui arrivent après les clés" },
    intro: {
      en: [
        "A closing gift is a thank-you from an agent, broker or lawyer to a client, timed to land once the deal is done and the family is in the house. The ones that work are shareable and useful in week one: good coffee or tea, gourmet snacks for the unpacking, chocolate for the first evening among the boxes. Nothing here carries a logo; the card is signed by you, which is what gets it photographed and remembered. The closing gifts guide in our journal covers timing, budgets and what the CRA lets you deduct.",
        "We deliver by hand across {cities}, same day before {cutoff}, so a basket can be at the new address the afternoon of closing or on any date you pick at checkout. For agents sending several a month, corporate pricing starts at ten baskets with one invoice and a plain or branded card for each client. Shippable baskets reach clients who bought elsewhere in Canada by tracked courier.",
      ],
      fr: [
        "Le cadeau de clôture est un merci d'un courtier, d'un prêteur ou d'un avocat à un client, qui arrive une fois la transaction conclue et la famille installée. Ceux qui marchent se partagent et servent dès la première semaine : un bon café ou du thé, des collations gourmet pour le déballage, du chocolat pour la première soirée au milieu des boîtes. Rien ici ne porte de logo; la carte est signée de votre nom, et c'est ce qui le fait photographier et retenir. Le guide des cadeaux de clôture dans notre journal traite du moment, des budgets et de ce que l'ARC permet de déduire.",
        "Nous livrons en main propre à {cities}, le jour même avant {cutoff}, pour qu'un panier soit à la nouvelle adresse l'après-midi de la clôture ou à toute date choisie à la caisse. Pour les courtiers qui en envoient plusieurs par mois, les prix d'entreprise commencent à dix paniers, avec une seule facture et une carte simple ou à votre image pour chaque client. Les paniers expédiables rejoignent les clients qui ont acheté ailleurs au Canada par transporteur avec suivi.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Can you deliver a closing gift on the day the keys are handed over?", fr: "Pouvez-vous livrer un cadeau de clôture le jour de la remise des clés ?" },
        a: {
          en: "Yes. Order before {cutoff} Eastern for same-day delivery in {cities}, or choose the closing date at checkout in advance and we deliver that day. Add the client's mobile number in case nobody is at the house yet.",
          fr: "Oui. Commandez avant {cutoff} (heure de l'Est) pour une livraison le jour même à {cities}, ou choisissez d'avance la date de clôture à la caisse et nous livrons ce jour-là. Ajoutez le cellulaire du client au cas où personne ne serait encore à la maison.",
        },
      },
      {
        q: { en: "Should a closing gift carry my branding?", fr: "Un cadeau de clôture doit-il porter ma marque ?" },
        a: {
          en: "Usually not. The card is signed by you and the basket itself carries no agent or brokerage logo, so it reads as a personal thank-you rather than an advertisement. Branded cards are available on corporate orders if your brokerage wants them.",
          fr: "En général, non. La carte est signée de votre nom et le panier ne porte aucun logo de courtier ou d'agence : il se lit comme un merci personnel plutôt qu'une publicité. Des cartes à votre image sont offertes sur les commandes d'entreprise si votre agence y tient.",
        },
      },
      {
        q: { en: "Can I set up closing gifts for every deal?", fr: "Puis-je prévoir un cadeau de clôture pour chaque transaction ?" },
        a: {
          en: "Yes. Request a corporate quote and tell us roughly how many closings a month. You get volume pricing from ten baskets, one invoice and a card for each client; send each address and date as the deal closes.",
          fr: "Oui. Demandez un devis d'entreprise et dites-nous à peu près combien de clôtures par mois. Vous obtenez un prix de volume dès dix paniers, une seule facture et une carte pour chaque client; envoyez chaque adresse et chaque date au fil des transactions.",
        },
      },
    ],
  },
  {
    slug: "thank-you",
    title: {
      en: "Thank You Gift Hampers & Baskets, Delivered in Mississauga & the GTA",
      fr: "Paniers-cadeaux de remerciement, livrés à Mississauga et dans le Grand Toronto",
    },
    description: {
      en: "Thank-you hampers for a neighbour, a client, a teacher, a host or a team, packed by hand in Mississauga. Same-day delivery across the GTA, tracked shipping across Canada.",
      fr: "Paniers de remerciement pour un voisin, un client, un enseignant, un hôte ou une équipe, emballés à la main à Mississauga. Livraison le jour même dans le Grand Toronto, expédition suivie partout au Canada.",
    },
    heading: { en: "Thank-you hampers, from a neighbour to a client list", fr: "Paniers de remerciement, du voisin à la liste de clients" },
    intro: {
      en: [
        "A thank-you hamper does its job when it arrives quickly and does not make a fuss. The baskets here are mostly shareable gourmet, chocolate and coffee gifts, with a few spa baskets for the friend who did more than they had to. They are the same baskets we send for client appreciation, referral thank-yous from real estate agents and mortgage brokers, and gifts for a team after a hard month.",
        "We deliver by hand in {cities}, same day before {cutoff}, and ship across Canada by tracked courier. For several recipients, corporate orders get volume pricing from ten baskets, a card for each person and delivery to any number of addresses.",
      ],
      fr: [
        "Un panier de remerciement fait son travail quand il arrive vite et sans cérémonie. Les paniers ici sont surtout des cadeaux gourmet, chocolat et café à partager, avec quelques paniers spa pour l'ami qui en a fait plus que nécessaire. Ce sont les mêmes paniers que nous envoyons pour remercier des clients, pour les références des courtiers immobiliers et hypothécaires, et pour une équipe après un mois difficile.",
        "Nous livrons en main propre à {cities}, le jour même avant {cutoff}, et expédions partout au Canada par transporteur avec suivi. Pour plusieurs destinataires, les commandes d'entreprise obtiennent des prix de volume dès dix paniers, une carte pour chaque personne et la livraison à autant d'adresses qu'il le faut.",
      ],
    },
    faq: [
      {
        needs: "same-day",
        q: { en: "Can a thank-you hamper be delivered to a client's office the same day?", fr: "Un panier de remerciement peut-il être livré au bureau d'un client le jour même ?" },
        a: {
          en: "Yes, in {cities}: order before {cutoff} Eastern, add the company name and any business-hours note to the address, and we time the drop for office hours.",
          fr: "Oui, à {cities} : commandez avant {cutoff} (heure de l'Est), ajoutez le nom de l'entreprise et les heures d'ouverture à l'adresse, et nous planifions le passage pendant les heures de bureau.",
        },
      },
      {
        q: { en: "Can I send thank-you hampers to several people at once?", fr: "Puis-je envoyer des paniers de remerciement à plusieurs personnes à la fois ?" },
        a: {
          en: "Yes. Checkout takes up to ten baskets to one address. For many addresses, or more than ten baskets, request a corporate quote and send us the list; volume pricing starts at ten baskets.",
          fr: "Oui. La caisse accepte jusqu'à dix paniers pour une adresse. Pour plusieurs adresses, ou plus de dix paniers, demandez un devis d'entreprise et envoyez-nous la liste; les prix de volume commencent à dix paniers.",
        },
      },
      {
        q: { en: "Can the card carry my company's logo?", fr: "La carte peut-elle porter le logo de mon entreprise ?" },
        a: {
          en: "On corporate orders, yes. Tell us in the quote request and we print a branded card, with a different message for each recipient if you want one.",
          fr: "Sur les commandes d'entreprise, oui. Indiquez-le dans la demande de devis et nous imprimons une carte à votre image, avec un message différent pour chaque destinataire si vous le souhaitez.",
        },
      },
    ],
  },
];
