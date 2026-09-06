import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";

export async function HowWeWork() {
  const t = await getTranslations("howWeWork");
  const steps = [
    { n: 1, title: t("s1"), sub: t("s1Sub") },
    { n: 2, title: t("s2"), sub: t("s2Sub") },
    { n: 3, title: t("s3"), sub: t("s3Sub") },
    { n: 4, title: t("s4"), sub: t("s4Sub") },
  ];
  return (
    <section className="container-x py-20">
      <div className="rounded-[2.25rem] border border-line bg-cream/60 px-6 py-14 sm:px-14">
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <h2 className="max-w-2xl font-display text-4xl leading-tight balance sm:text-5xl">
          {t("title")}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">
                  {s.n}
                </span>
                <p className="mt-5 text-lg font-semibold text-ink">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
