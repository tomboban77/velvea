import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  ArrowRight, CalendarDays, Download, Mail, PackagePlus, PenLine, Phone, Plus, Ribbon, Stamp,
} from "lucide-react";
import { ProductRail } from "@/components/shop/ProductRail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getActiveProductCount, getCollectionPreviews, getCorporateProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { BULK_FORM, CORPORATE_CHAPTERS, chapterPath } from "@/lib/corporate";
import { t as tc } from "@/lib/i18n-content";
import { cn, formatMoney } from "@/lib/utils";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/corporate",
    title: t("corporateTitle"),
    description: t("corporateDescription"),
  });
}

export default async function CorporatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const money = (cents: number) => formatMoney(cents, fr ? "fr-CA" : "en-CA");
  const tCorp = await getTranslations("corporate");
  const t = await getTranslations("corporatePage");
  // The corporate boxes go first: the collection tiles skip their photos so no
  // basket appears twice on the page.
  const products = await getCorporateProducts(8);
  const [chapters, basketCount, settings] = await Promise.all([
    getCollectionPreviews(CORPORATE_CHAPTERS, products.map((p) => p.id)),
    getActiveProductCount(),
    getSettings(),
  ]);
  const { email, phone } = settings.contact;
  const bulkForm = fr ? BULK_FORM.fr : BULK_FORM.en;
  const fan = products.flatMap((p) => (p.images[0] ? [p.images[0].url] : [])).slice(0, 3);
  const faq = t.raw("faq") as { q: string; a: string }[];

  const stats = [
    basketCount > 0 && { big: t("statBaskets", { count: basketCount }), sub: t("statBasketsSub") },
    { big: t("statReply"), sub: t("statReplySub") },
    { big: t("statVolume"), sub: t("statVolumeSub") },
  ].filter((s): s is { big: string; sub: string } => Boolean(s));

  const included = [
    { icon: Stamp, title: t("inc1"), sub: t("inc1Sub") },
    { icon: PenLine, title: t("inc2"), sub: t("inc2Sub") },
    { icon: CalendarDays, title: t("inc3"), sub: t("inc3Sub") },
  ];
  const branding = [
    { icon: Stamp, title: t("brand1"), sub: t("brand1Sub") },
    { icon: PenLine, title: t("brand2"), sub: t("brand2Sub") },
    { icon: Ribbon, title: t("brand3"), sub: t("brand3Sub") },
    { icon: PackagePlus, title: t("brand4"), sub: t("brand4Sub") },
  ];
  const steps = [
    { title: t("s1"), sub: t("s1Sub"), us: false },
    { title: t("s2"), sub: t("s2Sub"), us: false },
    { title: t("s3"), sub: t("s3Sub"), us: false },
    { title: t("s4"), sub: t("s4Sub"), us: true },
  ];

  return (
    <div>
      <JsonLd data={faqJsonLd(faq)} />

      {/* hero */}
      <section className="band-cream border-b border-line">
        <div className="container-x grid gap-12 py-14 lg:grid-cols-12 lg:items-center lg:py-20">
          <div className="lg:col-span-7">
            <p className="caps">{t("eyebrow")}</p>
            <h1 className="h-display mt-4 balance">{tCorp("pageTitle")}</h1>
            <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-ink-soft pretty">{t("lede")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/corporate/quote" className="btn btn-primary btn-lg">
                {tCorp("requestQuote")} <ArrowRight />
              </Link>
              <a href={bulkForm} download className="btn btn-outline btn-lg">
                <Download /> {t("downloadForm")}
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">{t("formMeta")}</p>
          </div>

          {fan.length > 0 && (
            // A fanned stack of the ready-to-order boxes: the corporate range at a glance.
            <div className="relative mx-auto aspect-5/4 w-full max-w-md lg:col-span-5 lg:max-w-none" aria-hidden>
              {fan.map((src, i) => (
                <div
                  key={src}
                  className={cn(
                    "absolute top-1/2 aspect-4/5 w-[56%] -translate-y-1/2 overflow-hidden rounded-lg border border-white bg-white shadow-[0_18px_40px_-18px_rgba(35,26,41,0.45)]",
                    fan.length === 1 && "left-[22%]",
                    fan.length > 1 && i === 0 && "left-[22%] z-20",
                    fan.length > 1 && i === 1 && "left-0 z-10 -rotate-6 scale-90",
                    i === 2 && "right-0 z-10 rotate-6 scale-90",
                  )}
                >
                  <Image src={src} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" priority={i === 0} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="container-x pb-10">
          <dl className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.sub} className="py-5 sm:px-6 sm:first:pl-0">
                <dt className="font-display text-[1.6rem] leading-tight text-ink">{s.big}</dt>
                <dd className="caps mt-1 text-muted">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* holiday planning */}
      <section className="band-ink">
        <div className="container-x section grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <span className="badge badge-gold">{t("holidayBadge")}</span>
            <h2 className="h-section mt-5 text-white balance">{t("holidayTitle")}</h2>
            <p className="mt-5 max-w-lg leading-relaxed text-white/72 pretty">{t("holidayBody")}</p>
            <Link href="/corporate/quote" className="btn btn-light btn-lg mt-8">
              {tCorp("requestQuote")} <ArrowRight />
            </Link>
            <p className="mt-4 text-sm text-white/50">{t("holidayNote")}</p>
          </div>
          <ul className="space-y-7 lg:col-span-5 lg:col-start-8 lg:self-center">
            {included.map(({ icon: Icon, title, sub }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-4 w-4 text-gold-pale" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[0.95rem] text-white/65">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* chapters: live collections in place of a printed catalogue */}
      {chapters.length > 0 && (
        <section className="container-x section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-2xl">
              <p className="caps">{t("chaptersEyebrow")}</p>
              <h2 className="h-section mt-4 balance">{t("chaptersTitle")}</h2>
              <p className="mt-4 text-ink-soft pretty">{t("chaptersLede")}</p>
            </div>
            <Link href="/baskets" className="link-draw shrink-0">
              {t("browseAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link href={chapterPath(c)} className="group block">
                  <span className="relative block aspect-4/5 overflow-hidden rounded-lg bg-cream">
                    {c.image && (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </span>
                  <span className="mt-4 block font-display text-[1.35rem] leading-tight text-ink">{tc(c.name, locale)}</span>
                  {c.fromCents != null && (
                    <span className="mt-1 block text-sm text-muted">
                      {t("chapterMeta", { count: c.count, price: money(c.fromCents) })}
                    </span>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-deep group-hover:underline">
                    {t("shopOnline")} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProductRail
        products={products}
        eyebrow={tCorp("readyEyebrow")}
        title={tCorp("readyTitle")}
        lede={tCorp("readyLede")}
        link="/recipients/clients"
        linkLabel={tCorp("shopCorporate")}
        tone="cream"
      />

      {/* branding */}
      <section className="band-ink">
        <div className="container-x section">
          <p className="caps text-gold-pale">{t("brandEyebrow")}</p>
          <h2 className="h-section mt-4 text-white balance">{t("brandTitle")}</h2>
          <ul className="mt-10 grid overflow-hidden rounded-lg border border-white/12 sm:grid-cols-2 lg:grid-cols-4">
            {branding.map(({ icon: Icon, title, sub }) => (
              <li key={title} className="border-white/12 p-7 not-last:border-b sm:odd:border-r lg:border-b-0 lg:not-last:border-r">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20">
                  <Icon className="h-4 w-4 text-gold-pale" strokeWidth={1.8} />
                </span>
                <p className="mt-6 font-display text-[1.35rem] leading-tight text-white">{title}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-white/65">{sub}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* bulk order */}
      <section className="container-x section">
        <p className="caps">{t("bulkEyebrow")}</p>
        <h2 className="h-section mt-4 balance">{t("bulkTitle")}</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((s, i) => (
            <li key={s.title} className="relative lg:pr-8">
              {/* the connecting rail, desktop only */}
              <span className="absolute left-0 right-0 top-[0.45rem] hidden h-px bg-line-strong lg:block" aria-hidden />
              <span className="relative block h-4 w-4 rounded-full border-4 border-cream bg-ink ring-1 ring-line-strong" aria-hidden />
              <span className="mt-5 block font-display text-[2.6rem] leading-none text-line-strong">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-[1.35rem] leading-tight text-ink">{s.title}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{s.sub}</p>
              <span className={cn("badge mt-4", s.us ? "badge-plum" : "border border-line-strong bg-white text-ink")}>
                {s.us ? t("us") : t("you")}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <a href={bulkForm} download className="btn btn-primary btn-lg">
            <Download /> {t("downloadForm")}
          </a>
          <a href={`mailto:${email}`} className="btn btn-outline btn-lg">
            <Mail /> {t("emailUs", { email })}
          </a>
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          {t("bulkNote")}{" "}
          <Link href="/corporate/quote" className="font-semibold text-violet-deep underline">{tCorp("requestQuote")}</Link>
        </p>
      </section>

      {/* FAQ: native <details>, so it works without client JS */}
      <section className="section band-cream border-t border-line">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="caps">{t("faqEyebrow")}</p>
            <h2 className="h-section mt-4 balance">{t("faqTitle")}</h2>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-line rounded-lg border border-line bg-white px-6 sm:px-8">
              {faq.map((item, i) => (
                <details key={item.q} className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <span className="text-[1.05rem] font-semibold leading-snug text-ink">{item.q}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors group-open:border-violet-deep group-open:bg-violet-deep group-open:text-white">
                      <Plus className="h-4 w-4 transition-transform group-open:rotate-45" strokeWidth={2} />
                    </span>
                  </summary>
                  <p className="pb-6 pr-14 text-[0.98rem] leading-relaxed text-ink-soft pretty">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* closing CTA */}
      <section className="container-x section text-center">
        <h2 className="h-section balance">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft pretty">{t("ctaBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/corporate/quote" className="btn btn-primary btn-lg">
            {tCorp("requestQuote")} <ArrowRight />
          </Link>
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn btn-outline btn-lg">
              <Phone /> {t("ctaCall", { phone })}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
