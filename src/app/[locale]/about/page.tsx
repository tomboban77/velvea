import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProsePage } from "@/components/ui/ProsePage";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Our Story" };

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  return (
    <ProsePage eyebrow={fr ? "Notre histoire" : "Our Story"} title={fr ? "Des cadeaux qui comptent" : "Gifts that mean something"}
      intro={fr ? "Velvea est une maison de paniers-cadeaux détenue par une femme, fondée en 2026 à Mississauga, en Ontario." : "Velvea is a woman-owned gift basket house, founded in 2026 in Mississauga, Ontario."}>
      <p>{fr
        ? "Nous croyons que le bon cadeau ne dépend jamais du prix, mais du moment. Chaque panier Velvea est composé avec soin, emballé à la main à la commande et arrangé pour arriver exactement comme en ligne."
        : "We believe the right gift never depends on price, but on the moment. Every Velvea basket is curated with care, hand-packed to order, and arranged to arrive exactly as it appeared online."}</p>
      <h2>{fr ? "Notre promesse" : "Our promise"}</h2>
      <p>{fr
        ? "Seuls de très bons produits entrent dans nos paniers. Nous privilégions des matériaux durables, une présentation soignée et une livraison fiable partout au Canada, avec le jour même à Mississauga et dans le Grand Toronto."
        : "Only genuinely good products make it into our baskets. We favour sustainable materials, considered presentation, and reliable delivery across Canada, with same-day service in Mississauga and the GTA."}</p>
      <h2>{fr ? "Fait à Mississauga" : "Made in Mississauga"}</h2>
      <p>{fr
        ? "De notre atelier à votre porte, chaque geste est pensé pour rendre l'attention mémorable."
        : "From our studio to your door, every detail is designed to make the thought memorable."}</p>
      <p><Link href="/baskets" className="btn btn-primary not-prose mt-4">{fr ? "Voir les paniers" : "Shop gift baskets"} <ArrowRight className="h-4 w-4" /></Link></p>
    </ProsePage>
  );
}
