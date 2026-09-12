import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Ornament } from "@/components/brand/Ornament";

/** Honest brand note, set like a letterpress card. */
export async function Atelier() {
  const t = await getTranslations("atelier");
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto max-w-4xl p-3">
            <div className="frame bg-shell px-8 py-14 text-center sm:px-16 sm:py-20">
              <p className="chapter">Chapter VI · {t("eyebrow")}</p>
              <Ornament className="mx-auto mt-4" />
              <blockquote className="mx-auto mt-9 max-w-3xl font-display text-[1.9rem] font-light leading-[1.3] text-ink balance sm:text-[2.5rem]">
                “{t("body1")}”
              </blockquote>
              <p className="mx-auto mt-9 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft pretty">{t("body2")}</p>
              <div className="mx-auto mt-10 h-px w-16 bg-gold-soft" />
              <p className="caps mt-5 text-[0.6rem] text-violet">{t("sign")}</p>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.22em] text-muted">{t("badge")}</p>
              <Link href="/about" className="link-draw mt-10 text-ink">
                {t("cta")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
