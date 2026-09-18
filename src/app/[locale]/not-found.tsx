import { Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { ArrowRight, Search } from "lucide-react";

export default async function NotFound() {
  const locale = await getLocale();
  const fr = locale === "fr";
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="caps">404</p>
      <h1 className="h-display mt-4">{fr ? "Page introuvable" : "We couldn't find that page"}</h1>
      <p className="mt-4 max-w-md text-ink-soft pretty">
        {fr ? "La page a peut-être été déplacée. Retournez à l'accueil ou explorez nos paniers." : "The page may have moved. Head home or explore our gift baskets."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/baskets" className="btn btn-primary">{fr ? "Voir les paniers" : "Shop gift baskets"} <ArrowRight /></Link>
        <Link href="/search" className="btn btn-outline"><Search /> {fr ? "Rechercher" : "Search"}</Link>
      </div>
    </div>
  );
}
