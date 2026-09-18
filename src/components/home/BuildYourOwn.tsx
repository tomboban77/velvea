import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

/** Full-bleed split: atelier photograph on one side, the three-step pitch on plum. */
export async function BuildYourOwn() {
  const t = await getTranslations("build");
  const locale = await getLocale();
  const steps = [
    { title: t("s1"), sub: t("s1Sub") },
    { title: t("s2"), sub: t("s2Sub") },
    { title: t("s3"), sub: t("s3Sub") },
  ];
  return (
    <section className="split band-plum">
      <div className="split-media">
        <Image
          src="/images/gifting-editorial.webp"
          alt={locale === "fr" ? "Inspiration de l’atelier : coffrets ivoire et rubans prune" : "Atelier inspiration: ivory gift boxes finished with plum ribbons"}
          fill
          sizes="(max-width:1023px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="split-copy flex flex-col justify-center">
        <p className="caps text-gold-pale">{t("eyebrow")}</p>
        <h2 className="h-section mt-4 text-white balance">{t("title")}</h2>
        <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-white/75 pretty">{t("lede")}</p>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 sm:block">
              <span className="step-num text-gold-pale">{i + 1}</span>
              <div className="sm:mt-4">
                <p className="font-semibold text-white">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{s.sub}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-9">
          <Link href="/custom" className="btn btn-light btn-lg">
            {t("cta")} <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
