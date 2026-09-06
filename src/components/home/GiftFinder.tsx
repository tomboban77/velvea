"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

export function GiftFinder() {
  const t = useTranslations("giftFinder");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ who?: string; occ?: string; budget?: string }>({});

  const who: Option[] =
    locale === "fr"
      ? [
          { label: "Pour elle", value: "for-her" },
          { label: "Pour lui", value: "for-him" },
          { label: "Nouveau bébé", value: "new-baby" },
          { label: "Nouveaux parents", value: "new-parents" },
          { label: "Un couple", value: "couples" },
          { label: "Famille", value: "family" },
          { label: "Un ami", value: "a-friend" },
          { label: "Client ou collègue", value: "clients" },
        ]
      : [
          { label: "For Her", value: "for-her" },
          { label: "For Him", value: "for-him" },
          { label: "New Baby", value: "new-baby" },
          { label: "New Parents", value: "new-parents" },
          { label: "A Couple", value: "couples" },
          { label: "Family", value: "family" },
          { label: "A Friend", value: "a-friend" },
          { label: "Colleague or Client", value: "clients" },
        ];

  const occ: Option[] =
    locale === "fr"
      ? [
          { label: "Anniversaire", value: "birthday" },
          { label: "Remerciement", value: "thank-you" },
          { label: "Sympathie", value: "sympathy" },
          { label: "Naissance", value: "new-baby" },
          { label: "Félicitations", value: "congratulations" },
          { label: "Prompt rétablissement", value: "get-well" },
          { label: "Fêtes", value: "holiday" },
          { label: "Juste comme ça", value: "" },
        ]
      : [
          { label: "Birthday", value: "birthday" },
          { label: "Thank You", value: "thank-you" },
          { label: "Sympathy", value: "sympathy" },
          { label: "New Baby", value: "new-baby" },
          { label: "Congratulations", value: "congratulations" },
          { label: "Get Well", value: "get-well" },
          { label: "Holiday", value: "holiday" },
          { label: "Just Because", value: "" },
        ];

  const budget: Option[] = [
    { label: locale === "fr" ? "Moins de 75 $" : "Under $75", value: "7500" },
    { label: "$75 – $125", value: "12500" },
    { label: "$125 – $200", value: "20000" },
    { label: locale === "fr" ? "200 $ et plus" : "$200+", value: "0" },
  ];

  const steps = [
    { key: "who", q: t("q1"), options: who },
    { key: "occ", q: t("q2"), options: occ },
    { key: "budget", q: t("q3"), options: budget },
  ] as const;

  function pick(value: string) {
    const key = steps[step].key;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < 2) {
      setStep(step + 1);
    } else {
      finish(next);
    }
  }

  function finish(a: typeof answers) {
    const params = new URLSearchParams();
    if (a.who) params.set("recipient", a.who);
    if (a.budget && a.budget !== "0") params.set("max", a.budget);
    const base = a.occ ? `/occasions/${a.occ}` : "/baskets";
    router.push(`${base}?${params.toString()}`);
  }

  const progress = ((step + 1) / 3) * 100;

  return (
    <section className="container-x py-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-line bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff,#f3ecdd)] px-6 py-14 shadow-sm sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--grad-iris)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> {t("eyebrow")}
          </p>
          <h2 className="font-display text-4xl leading-tight balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">{t("lede")}</p>

          {/* progress */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-iris transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("step", { current: step + 1, total: 3 })}
            </span>
          </div>

          <p className="mt-8 font-display text-2xl">{steps[step].q}</p>

          <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2.5">
            {steps[step].options.map((o) => (
              <button
                key={o.label}
                onClick={() => pick(o.value)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                  "border-line-strong bg-canvas text-ink hover:border-ink hover:shadow-sm hover:-translate-y-0.5"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-sm">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 text-muted hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" /> {t("back")}
              </button>
            ) : (
              <span />
            )}
            {(answers.who || step > 0) && (
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                }}
                className="inline-flex items-center gap-1.5 text-muted hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("start")}
              </button>
            )}
            <button
              onClick={() => finish(answers)}
              className="inline-flex items-center gap-1.5 font-semibold text-gold hover:gap-2.5 transition-all"
            >
              {t("anyone")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
