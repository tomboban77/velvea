import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";

export async function Story() {
  const t = await getTranslations("story");
  const stats = [
    { value: "2026", label: t("statSince") },
    { value: "700+", label: t("statBaskets") },
    { value: "Same-day", label: "GTA delivery" },
  ];

  return (
    <section className="container-x py-20">
      <Reveal>
        <div className="grid gap-8 border-b border-line pb-12 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-display text-4xl text-ink sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(120%_120%_at_20%_10%,#f5efe3,#e3d6bd)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-6xl text-line-strong">Velvéa</span>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full opacity-30 blur-2xl"
              style={{ background: "var(--grad-iris)" }}
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="font-display text-3xl leading-tight balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">{t("body1")}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">{t("body2")}</p>

          <h3 className="mt-8 font-display text-2xl">{t("corpTitle")}</h3>
          <p className="mt-3 leading-relaxed text-ink-soft">{t("corpBody")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/about" className="btn btn-outline btn-sm">
              {t("title")}
            </Link>
            <Link href="/corporate" className="btn btn-ghost btn-sm text-gold">
              {t("corpTitle")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
