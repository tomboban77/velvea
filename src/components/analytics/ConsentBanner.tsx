"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

const KEY = "velvea_consent";
type Choice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyChoice(choice: Choice) {
  window.gtag?.("consent", "update", { analytics_storage: choice });
}

/**
 * Analytics consent. Google Analytics starts with consent denied (see
 * <GoogleAnalytics>); this banner is the only thing that flips it to granted,
 * and the choice is remembered per browser. Declining is one click and equal
 * in weight to accepting. Rendered only when GA is configured.
 */
export function ConsentBanner() {
  const fr = useLocale() === "fr";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(KEY);
    } catch {
      // Private mode or blocked storage: ask every visit, never crash.
    }
    if (stored === "granted" || stored === "denied") applyChoice(stored);
    else setOpen(true);
  }, []);

  function choose(choice: Choice) {
    applyChoice(choice);
    try {
      window.localStorage.setItem(KEY, choice);
    } catch {
      // Nothing to do: the choice still applies for this page view.
    }
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={fr ? "Témoins d'analyse" : "Analytics cookies"}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-lg border border-line bg-white p-4 shadow-lg sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        {fr
          ? "Nous aimerions utiliser Google Analytics pour comprendre comment le site est utilisé. Aucun témoin d'analyse n'est déposé sans votre accord. "
          : "We'd like to use Google Analytics to understand how the site is used. No analytics cookie is set without your consent. "}
        <Link href="/privacy" className="underline hover:text-violet-deep">
          {fr ? "Politique de confidentialité" : "Privacy policy"}
        </Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => choose("denied")} className="btn btn-outline">
          {fr ? "Refuser" : "Decline"}
        </button>
        <button type="button" onClick={() => choose("granted")} className="btn btn-primary">
          {fr ? "Accepter" : "Accept"}
        </button>
      </div>
    </div>
  );
}
