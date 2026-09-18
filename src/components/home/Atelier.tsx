import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

/** Brand note: photograph beside the founder's belief, set plainly. */
export async function Atelier() {
  const t = await getTranslations("atelier");
  const locale = await getLocale();
  return (
    <section className="section">
      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream lg:aspect-[5/6]">
            <Image
              src="/images/gifting-editorial.webp"
              alt={locale === "fr" ? "Coffrets ivoire et rubans prune sur une table en travertin" : "Ivory gift boxes with plum ribbon on a travertine table"}
              fill
              sizes="(max-width:1023px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-6">
          <p className="caps">{t("eyebrow")}</p>
          <h2 className="h-section mt-4 balance">{t("title")}</h2>
          <blockquote className="mt-7 border-l-2 border-violet-deep pl-6 font-display text-[1.35rem] italic leading-[1.4] text-ink sm:text-[1.6rem]">
            “{t("body1")}”
          </blockquote>
          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft pretty">{t("body2")}</p>
          <p className="mt-6 text-sm font-semibold text-ink">
            {t("sign")} <span className="font-normal text-muted">· {t("badge")}</span>
          </p>
          <Link href="/about" className="link-draw mt-8">
            {t("cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
