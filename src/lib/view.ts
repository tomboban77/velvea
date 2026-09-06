import { t } from "./i18n-content";
import type { ProductCard } from "./queries";

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  priceCents: number;
  compareAtCents: number | null;
  image: string | null;
  secondImage: string | null;
  rating: number;
  reviewCount: number;
  badges: string[];
};

export function toProductView(p: ProductCard, locale: string): ProductView {
  return {
    id: p.id,
    slug: p.slug,
    name: t(p.name, locale),
    tagline: t(p.tagline, locale),
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    image: p.images[0]?.url ?? null,
    secondImage: p.images[1]?.url ?? null,
    rating: p.avgRating,
    reviewCount: p.reviewCount,
    badges: p.badges ?? [],
  };
}
