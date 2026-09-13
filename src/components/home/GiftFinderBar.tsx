"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

/** Native selects keep the gift finder easy to use on touch devices. */
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

  const opts = (m: Record<string, { en: string; fr: string }>): { value: string; label: string }[] =>
    Object.entries(m).map(([value, l]) => ({ value, label: fr ? l.fr : l.en }));

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (max && max !== "999999") params.set("max", max);
    if (max === "999999") params.set("min", "20000");
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
    <section className="container-x gift-finder" aria-label={t("eyebrow")}>
      <div className="finder-panel">
        <div><p className="eyebrow no-tick">{t("eyebrow")}</p><p className="mt-2 font-display text-2xl leading-tight">{fr ? "Une attention bien trouvée." : "Something just for them."}</p></div>
        <form onSubmit={go} className="finder-form">
          <label><span>{t("who")}</span><select value={who} onChange={(e) => setWho(e.target.value)}>{opts(WHO).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
          <label><span>{t("occasion")}</span><select value={occ} onChange={(e) => setOcc(e.target.value)}>{opts(OCC).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
          <label><span>{t("budget")}</span><select value={max} onChange={(e) => setMax(e.target.value)}>{opts(BUDGET).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
          <button type="submit" className="btn btn-primary">{t("cta")}<ArrowRight /></button>
        </form>
      </div>
    </section>
  );
}
