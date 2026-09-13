import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export async function BuildYourOwn() {
  const t = await getTranslations("build");
  const locale = await getLocale();
  const steps = [{ title: t("s1"), sub: t("s1Sub") }, { title: t("s2"), sub: t("s2Sub") }, { title: t("s3"), sub: t("s3Sub") }];
  return <section className="container-x py-10 sm:py-14"><div className="custom-feature grid lg:grid-cols-2">
    <div className="custom-feature-image"><Image src="/images/gifting-editorial.webp" alt={locale === "fr" ? "Inspiration de l’atelier : coffrets ivoire et rubans prune" : "Atelier inspiration: ivory gift boxes finished with plum ribbons"} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" /><span className="absolute bottom-6 left-6 rounded-full bg-canvas/90 px-4 py-2 text-xs text-ink backdrop-blur-sm">{t("previewNote")}</span></div>
    <Reveal className="custom-feature-copy"><p className="eyebrow no-tick">{t("eyebrow")}</p><h2 className="h-section mt-5 balance">{t("title")}</h2><p className="mt-5 text-base leading-relaxed text-ink-soft">{t("lede")}</p>
      <ol className="my-7 space-y-5">{steps.map((s, i) => <li key={s.title} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-xs text-violet">0{i + 1}</span><div><p className="text-sm font-medium">{s.title}</p><p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.sub}</p></div></li>)}</ol>
      <Link href="/custom" className="btn btn-primary">{t("cta")}<ArrowUpRight /></Link>
    </Reveal>
  </div></section>;
}
