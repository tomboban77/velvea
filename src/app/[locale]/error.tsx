"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { AlertTriangle } from "lucide-react";

/**
 * Branded fallback for an uncaught error anywhere under a locale route. Without
 * this Next shows an unstyled "Application error" page. Nothing here reads the
 * database, so it renders even when the failure was the database.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const fr = useLocale() === "fr";

  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <div className="container-x max-w-xl py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
        <AlertTriangle className="h-8 w-8 text-violet-deep" />
      </div>
      <h1 className="mt-5 font-display text-3xl">
        {fr ? "Un problème est survenu" : "Something went wrong"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {fr
          ? "La page n'a pas pu se charger. Réessayez dans un instant; si le problème persiste, écrivez-nous et nous vous aiderons."
          : "This page couldn't load. Try again in a moment; if it keeps happening, write to us and we'll sort it out."}
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted">
          {fr ? "Référence" : "Reference"}: {error.digest}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">
          {fr ? "Réessayer" : "Try again"}
        </button>
        <Link href="/" className="btn btn-outline">
          {fr ? "Retour à l'accueil" : "Back to home"}
        </Link>
        <Link href="/contact" className="btn btn-outline">
          {fr ? "Nous joindre" : "Contact us"}
        </Link>
      </div>
    </div>
  );
}
