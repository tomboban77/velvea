import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight, Check, PenLine } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Ornament } from "@/components/brand/Ornament";

export async function BuildYourOwn() {
  const t = await getTranslations("build");
  const steps = [
    { n: "I", title: t("s1"), sub: t("s1Sub") },
    { n: "II", title: t("s2"), sub: t("s2Sub") },
    { n: "III", title: t("s3"), sub: t("s3Sub") },
  ];
  const items = t("previewItems").split("·").map((s) => s.trim());
  const swatches = ["#382860", "#b88870", "#e9e4ef", "#5b4680"];

  return (
    <section className="section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12">
        {/* copy */}
        <Reveal className="lg:col-span-5">
          <p className="chapter">Chapter III · {t("eyebrow")}</p>
          <Ornament className="mt-4" />
          <h2 className="h-section mt-7 balance">{t("title")}</h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft pretty">{t("lede")}</p>

          <ol className="mt-9 divide-y divide-line border-y border-line">
            {steps.map((s) => (
              <li key={s.n} className="flex items-baseline gap-6 py-4">
                <span className="font-caps w-8 shrink-0 text-[0.75rem] tracking-[0.2em] text-violet">{s.n}</span>
                <div>
                  <p className="font-display text-[1.3rem] leading-tight text-ink">{s.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href="/custom" className="btn btn-primary mt-9">
            {t("cta")} <ArrowRight />
          </Link>
        </Reveal>

        {/* order-slip preview */}
        <Reveal delay={140} className="lg:col-span-6 lg:col-start-7">
          <div className="mx-auto max-w-[32rem] p-3">
            <div className="frame relative bg-shell p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <p className="chapter">{t("previewTitle")}</p>
                <p className="chapter text-violet">{t("previewNote")}</p>
              </div>
              <Ornament className="mx-auto mt-5" />

              <div className="mt-7 flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="font-display text-[1.35rem] text-ink">{t("previewVessel")}</p>
                  <p className="text-xs text-muted">{t("s1")}</p>
                </div>
                <span className="flex h-6 w-6 items-center justify-center border border-violet-deep text-violet-deep">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </div>

              <ul className="divide-y divide-line">
                {items.map((it, i) => (
                  <li key={it} className="flex items-center gap-4 py-3.5">
                    <span className="h-7 w-7 shrink-0" style={{ background: swatches[i % swatches.length] }} />
                    <p className="flex-1 font-display text-[1.15rem] text-ink">{it}</p>
                    <span className="font-caps text-[0.6rem] tracking-[0.2em] text-muted">{["I", "II", "III", "IV"][i]}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-start gap-3 border border-dashed border-line-strong p-4">
                <PenLine className="mt-1 h-4 w-4 text-violet" strokeWidth={1.6} />
                <p className="font-display text-[1.1rem] italic text-ink-soft">“{t("s3Sub")}”</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
