"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Ornament } from "@/components/brand/Ornament";

/**
 * Sentence-style gift finder:
 * "I'm looking for a gift for [her], for [a birthday], [under $125]."
 * Each blank is a custom listbox in italic display type.
 */
const WHO: Record<string, { en: string; fr: string }> = {
  "": { en: "someone special", fr: "quelqu'un de spécial" },
  "for-her": { en: "her", fr: "elle" },
  "for-him": { en: "him", fr: "lui" },
  couples: { en: "a couple", fr: "un couple" },
  "new-parents": { en: "new parents", fr: "de nouveaux parents" },
  family: { en: "the family", fr: "la famille" },
  clients: { en: "a client", fr: "un client" },
  employees: { en: "a colleague", fr: "un collègue" },
  "a-friend": { en: "a friend", fr: "un ami" },
};

const OCC: Record<string, { en: string; fr: string }> = {
  "": { en: "any occasion", fr: "toute occasion" },
  birthday: { en: "a birthday", fr: "un anniversaire" },
  anniversary: { en: "an anniversary", fr: "un anniversaire de mariage" },
  "thank-you": { en: "a thank-you", fr: "un merci" },
  sympathy: { en: "sympathy", fr: "la sympathie" },
  "new-baby": { en: "a new baby", fr: "une naissance" },
  "get-well": { en: "get-well wishes", fr: "un prompt rétablissement" },
  congratulations: { en: "congratulations", fr: "des félicitations" },
  housewarming: { en: "a housewarming", fr: "une pendaison de crémaillère" },
  wedding: { en: "a wedding", fr: "un mariage" },
  holiday: { en: "the holidays", fr: "les fêtes" },
};

const BUDGET: Record<string, { en: string; fr: string }> = {
  "": { en: "at any budget", fr: "à tout budget" },
  "7500": { en: "under $75", fr: "à moins de 75 $" },
  "12500": { en: "under $125", fr: "à moins de 125 $" },
  "20000": { en: "under $200", fr: "à moins de 200 $" },
  "999999": { en: "from $200 and up", fr: "à partir de 200 $" },
};

export function GiftFinderBar() {
  const t = useTranslations("finder");
  const locale = useLocale();
  const fr = locale === "fr";
  const router = useRouter();
  const [who, setWho] = useState("");
  const [occ, setOcc] = useState("");
  const [max, setMax] = useState("");

  const opts = (m: Record<string, { en: string; fr: string }>): SelectOption[] =>
    Object.entries(m).map(([value, l]) => ({ value, label: fr ? l.fr : l.en }));

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (max && max !== "999999") params.set("max", max);
    let base = "/baskets";
    if (occ) {
      base = `/occasions/${occ}`;
      if (who) params.set("recipient", who);
    } else if (who) {
      base = `/recipients/${who}`;
    }
    const qs = params.toString();
    router.push(`${base}${qs ? `?${qs}` : ""}`);
  }

  return (
    <section className="container-x section-sm">
      <div className="frame relative mx-auto max-w-5xl bg-shell px-6 py-10 sm:px-12 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <p className="chapter">{t("eyebrow")}</p>
          <Ornament className="mt-3" />
        </div>

        <form onSubmit={go} className="mt-8 flex flex-col items-center gap-8">
          <div className="max-w-4xl text-center font-display text-[1.7rem] leading-[1.7] text-ink sm:text-[2.1rem] lg:text-[2.4rem]">
            {fr ? "Je cherche un cadeau pour" : "I’m looking for a gift for"}{" "}
            <Select value={who} onChange={setWho} options={opts(WHO)} ariaLabel={t("who")} variant="phrase" className="mx-1 align-baseline" />
            {fr ? ", pour" : ", for"}{" "}
            <Select value={occ} onChange={setOcc} options={opts(OCC)} ariaLabel={t("occasion")} variant="phrase" className="mx-1 align-baseline" />
            {", "}
            <Select value={max} onChange={setMax} options={opts(BUDGET)} ariaLabel={t("budget")} variant="phrase" className="mx-1 align-baseline" />
            .
          </div>
          <button type="submit" className="btn btn-gold">
            {t("cta")} <ArrowRight />
          </button>
        </form>
      </div>
    </section>
  );
}
