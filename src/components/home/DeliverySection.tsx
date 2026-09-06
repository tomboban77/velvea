"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Clock, Truck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PROVINCES = ["BC", "AB", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU"];
const SAME_DAY = new Set(["ON"]);

export function DeliverySection() {
  const t = useTranslations("delivery");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section
      className="relative overflow-hidden text-canvas"
      style={{ background: "linear-gradient(155deg,#1e141f 0%,#2b1c2c 52%,#181017 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full opacity-[0.18] blur-[110px]"
        style={{ background: "var(--grad-iris)" }}
      />
      <div className="container-x relative grid gap-12 py-24 lg:grid-cols-2">
        {/* left */}
        <div>
          <p className="eyebrow mb-4 text-gold-soft">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-[1.08] balance text-canvas sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-lg text-canvas/70">{t("lede")}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: MapPin, title: t("tileCanada"), sub: t("tileCanadaSub") },
              { icon: Clock, title: t("tileSameDay"), sub: t("tileSameDaySub") },
              { icon: Truck, title: t("tileReliable"), sub: t("tileReliableSub") },
            ].map((tile) => (
              <div key={tile.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <tile.icon className="h-5 w-5 text-gold-soft" />
                <p className="mt-3 font-display text-lg text-canvas">{tile.title}</p>
                <p className="mt-1 text-xs text-canvas/55">{tile.sub}</p>
              </div>
            ))}
          </div>

          <ol className="mt-8 space-y-5">
            {[
              { n: 1, title: t("step1"), sub: t("step1Sub") },
              { n: 2, title: t("step2"), sub: t("step2Sub") },
              { n: 3, title: t("step3"), sub: t("step3Sub") },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-soft/50 text-xs font-semibold text-gold-soft">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-canvas">{s.title}</p>
                  <p className="mt-0.5 text-sm text-canvas/60">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* right — province picker */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/50">
            {t("coverage")} · {t("selectProvince")}
          </p>
          <div className="mt-5 grid grid-cols-5 gap-2.5">
            {PROVINCES.map((p) => (
              <button
                key={p}
                onClick={() => setSelected(p)}
                className={cn(
                  "aspect-square rounded-xl border text-sm font-semibold transition-all",
                  selected === p
                    ? "border-gold-soft bg-gold-soft/15 text-gold-soft"
                    : "border-white/10 bg-white/[0.03] text-canvas/70 hover:border-white/25 hover:text-canvas"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {selected ? (
              <div>
                <p className="font-display text-2xl text-canvas">
                  {regionName(selected)}
                </p>
                {SAME_DAY.has(selected) ? (
                  <div className="mt-3 space-y-2 text-sm text-canvas/70">
                    <p className="flex items-center gap-2 text-gold-soft">
                      <Clock className="h-4 w-4" /> {t("gtaLocalSub")}
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-teal" /> {t("allProvincesSub")}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 flex items-center gap-2 text-sm text-canvas/70">
                    <Check className="h-4 w-4 text-teal" /> {t("allProvincesSub")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-canvas/55">{t("provinceHint")}</p>
            )}
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-start gap-3 border-t border-white/10 pt-3">
              <MapPin className="mt-0.5 h-4 w-4 text-gold-soft" />
              <div>
                <p className="font-medium text-canvas">{t("allProvinces")}</p>
                <p className="text-canvas/55">{t("majorCities")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/10 pt-3">
              <Clock className="mt-0.5 h-4 w-4 text-gold-soft" />
              <div>
                <p className="font-medium text-canvas">{t("gtaLocal")}</p>
                <p className="text-canvas/55">{t("gtaLocalSub")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function regionName(code: string): string {
  const names: Record<string, string> = {
    BC: "British Columbia",
    AB: "Alberta",
    SK: "Saskatchewan",
    MB: "Manitoba",
    ON: "Ontario",
    QC: "Québec",
    NB: "New Brunswick",
    NS: "Nova Scotia",
    PE: "Prince Edward Island",
    NL: "Newfoundland & Labrador",
    YT: "Yukon",
    NT: "Northwest Territories",
    NU: "Nunavut",
  };
  return names[code] ?? code;
}
