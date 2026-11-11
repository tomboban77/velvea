"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { OVER_CENTS, PRICE_STEPS } from "@/lib/price-steps";

/** Native selects keep the gift finder easy to use on touch devices. */
const WHO: Record<string, { en: string; fr: string }> = {
  "": { en: "Anyone", fr: "N’importe qui" },
  "for-her": { en: "For her", fr: "Pour elle" },
  "for-him": { en: "For him", fr: "Pour lui" },
  couples: { en: "A couple", fr: "Un couple" },
  "new-parents": { en: "New parents", fr: "De nouveaux parents" },
  family: { en: "The family", fr: "La famille" },
  clients: { en: "A client", fr: "Un client" },
  employees: { en: "A colleague", fr: "Un collègue" },
  "a-friend": { en: "A friend", fr: "Un ami" },
};

const OCC: Record<string, { en: string; fr: string }> = {
  "": { en: "Any occasion", fr: "Toute occasion" },
  birthday: { en: "Birthday", fr: "Anniversaire" },
  anniversary: { en: "Anniversary", fr: "Anniversaire de mariage" },
  "thank-you": { en: "Thank you", fr: "Merci" },
  sympathy: { en: "Sympathy", fr: "Sympathie" },
  "new-baby": { en: "New baby", fr: "Naissance" },
  "get-well": { en: "Get well", fr: "Prompt rétablissement" },
  congratulations: { en: "Congratulations", fr: "Félicitations" },
  housewarming: { en: "Housewarming", fr: "Pendaison de crémaillère" },
  wedding: { en: "Wedding", fr: "Mariage" },
  holiday: { en: "The holidays", fr: "Les fêtes" },
};

/** Sentinel for the open-ended bucket; it becomes `min=` rather than `max=`. */
const OVER = "over";

export function GiftFinderBar() {
  const t = useTranslations("finder");
  const locale = useLocale();
  const fr = locale === "fr";
  const router = useRouter();
  const [who, setWho] = useState("");
  const [occ, setOcc] = useState("");
  const [max, setMax] = useState("");

  const opts = (m: Record<string, { en: string; fr: string }>): { value: string; label: string }[] =>
    Object.entries(m).map(([value, l]) => ({ value, label: fr ? l.fr : l.en }));
  const money = (c: number) => formatMoney(c, fr ? "fr-CA" : "en-CA").replace(/[.,]00/, "");
  const budgets: { value: string; label: string }[] = [
    { value: "", label: t("budgetAny") },
    ...PRICE_STEPS.map((p) => ({ value: String(p), label: t("under", { amount: money(p) }) })),
    { value: OVER, label: t("over", { amount: money(OVER_CENTS) }) },
  ];

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (max === OVER) params.set("min", String(OVER_CENTS));
    else if (max) params.set("max", max);
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
    <section className="finder" aria-label={t("eyebrow")}>
      <div className="container-x finder-inner">
        <div>
          <p className="caps">{t("eyebrow")}</p>
          <p className="h-sub mt-2">{t("title")}</p>
        </div>
        <form onSubmit={go} className="finder-form">
          <label>
            <span>{t("who")}</span>
            <select className="field" value={who} onChange={(e) => setWho(e.target.value)}>
              {opts(WHO).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            <span>{t("occasion")}</span>
            <select className="field" value={occ} onChange={(e) => setOcc(e.target.value)}>
              {opts(OCC).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            <span>{t("budget")}</span>
            <select className="field" value={max} onChange={(e) => setMax(e.target.value)}>
              {budgets.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">
            {t("cta")} <ArrowRight />
          </button>
        </form>
      </div>
    </section>
  );
}
