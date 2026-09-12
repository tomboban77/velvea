import { Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { Home, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default async function NotFound() {
  const locale = await getLocale();
  const fr = locale === "fr";
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Logo height={40} />
      <p className="mt-6 font-display text-7xl text-line-strong">404</p>
      <h1 className="mt-2 font-display text-3xl">
        {fr ? "Page introuvable" : "We couldn't find that page"}
      </h1>
      <p className="mt-3 max-w-md text-muted">
        {fr
          ? "La page a peut-être été déplacée. Retournez à l'accueil ou explorez nos paniers."
          : "The page may have moved. Head home or explore our gift baskets."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary"><Home className="h-4 w-4" /> {fr ? "Accueil" : "Home"}</Link>
        <Link href="/baskets" className="btn btn-outline"><Search className="h-4 w-4" /> {fr ? "Voir les paniers" : "Shop baskets"}</Link>
      </div>
    </div>
  );
}
