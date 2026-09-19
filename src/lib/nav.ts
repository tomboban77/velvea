// Canonical storefront taxonomy. Slugs here match the seeded collections.
export type NavLink = { slug: string; en: string; fr: string; emoji?: string };

export const OCCASIONS: NavLink[] = [
  { slug: "birthday", en: "Birthday", fr: "Anniversaire" },
  { slug: "anniversary", en: "Anniversary", fr: "Anniversaire de mariage" },
  { slug: "thank-you", en: "Thank You", fr: "Merci" },
  { slug: "sympathy", en: "Sympathy", fr: "Sympathie" },
  { slug: "new-baby", en: "New Baby", fr: "Naissance" },
  { slug: "get-well", en: "Get Well", fr: "Prompt rétablissement" },
  { slug: "congratulations", en: "Congratulations", fr: "Félicitations" },
  { slug: "housewarming", en: "Housewarming", fr: "Pendaison de crémaillère" },
  { slug: "wedding", en: "Wedding", fr: "Mariage" },
  { slug: "graduation", en: "Graduation", fr: "Remise des diplômes" },
  { slug: "new-job", en: "New Job", fr: "Nouvel emploi" },
  { slug: "retirement", en: "Retirement", fr: "Retraite" },
  { slug: "thinking-of-you", en: "Thinking of You", fr: "Je pense à toi" },
  { slug: "just-because", en: "Just Because", fr: "Juste comme ça" },
  { slug: "holiday", en: "Holiday", fr: "Fêtes" },
];

export const RECIPIENTS: NavLink[] = [
  { slug: "for-him", en: "For Him", fr: "Pour lui" },
  { slug: "for-her", en: "For Her", fr: "Pour elle" },
  { slug: "couples", en: "Couples", fr: "Couples" },
  { slug: "new-parents", en: "New Parents", fr: "Nouveaux parents" },
  { slug: "family", en: "Family", fr: "Famille" },
  { slug: "clients", en: "Clients", fr: "Clients" },
  { slug: "employees", en: "Employees", fr: "Employés" },
  { slug: "a-friend", en: "A Friend", fr: "Un ami" },
];

// No alcohol category: reselling liquor in Ontario needs AGCO authorisation
// that we do not hold, so nothing alcoholic is listed or sold. If that ever
// changes, the licence comes first — see the builder add-on that is disabled
// for the same reason.
export const CATEGORIES: NavLink[] = [
  { slug: "gourmet", en: "Gourmet & Snacks", fr: "Gourmet & collations" },
  { slug: "chocolate", en: "Chocolate", fr: "Chocolat" },
  { slug: "spa-wellness", en: "Spa & Wellness", fr: "Spa & bien-être" },
  { slug: "coffee-tea", en: "Coffee & Tea", fr: "Café & thé" },
  { slug: "fresh-fruit", en: "Fresh Fruit", fr: "Fruits frais" },
  { slug: "vegan", en: "Vegan", fr: "Végane" },
  { slug: "baby", en: "Baby", fr: "Bébé" },
];

export const HOLIDAYS: NavLink[] = [
  { slug: "christmas", en: "Christmas", fr: "Noël" },
  { slug: "holiday", en: "Holiday Season", fr: "Temps des fêtes" },
  { slug: "valentines", en: "Valentine's Day", fr: "Saint-Valentin" },
  { slug: "mothers-day", en: "Mother's Day", fr: "Fête des Mères" },
  { slug: "fathers-day", en: "Father's Day", fr: "Fête des Pères" },
  { slug: "thanksgiving", en: "Thanksgiving", fr: "Action de grâce" },
];

export function labelFor(link: NavLink, locale: string): string {
  return locale === "fr" ? link.fr : link.en;
}
