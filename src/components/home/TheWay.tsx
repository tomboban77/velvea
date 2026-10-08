import { getTranslations, getLocale } from "next-intl/server";
import { CITY_PAGES } from "@/lib/cities";
import { Link } from "@/i18n/routing";
import { ArrowRight, MapPin, Truck, BadgePercent } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** How it works (three numbered steps) plus delivery facts, in one calm section. */
export async function TheWay() {
  const t = await getTranslations("way");
  const fr = (await getLocale()) === "fr";
  const steps = [
    { title: t("s1"), sub: t("s1Sub") },
    { title: t("s2"), sub: t("s2Sub") },
    { title: t("s3"), sub: t("s3Sub") },
  ];
  const facts = [
    { icon: MapPin, title: t("f1"), sub: t("f1Sub") },
    { icon: Truck, title: t("f2"), sub: t("f2Sub") },
    { icon: BadgePercent, title: t("f3"), sub: t("f3Sub") },
  ];

  return (
    <section className="section band-cream">
      <div className="container-x">
        <SectionHeading eyebrow={t("stepsEyebrow")} title={t("title")} link="/shipping" linkLabel={t("link")} />

        <ol className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((st, i) => (
            <li key={st.title} className="rounded-lg border border-line bg-white p-7">
              <span className="step-num text-violet-deep">{i + 1}</span>
              <p className="mt-5 font-display text-[1.45rem] leading-tight text-ink">{st.title}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft pretty">{st.sub}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid divide-y divide-line rounded-lg border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {facts.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-4 px-6 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lilac text-violet-deep">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[0.95rem] font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-soft">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Crawlable links to every city page: without them the homepage, the
            site's strongest page, passed nothing to the local landing pages. */}
        <nav aria-label={fr ? "Livraison par ville" : "Delivery by city"} className="mt-6 text-sm text-ink-soft">
          <span className="font-semibold text-ink">{fr ? "Nous livrons à " : "We deliver to "}</span>
          {CITY_PAGES.map((c, i) => (
            <span key={c.slug}>
              <Link href={`/delivery/${c.slug}`} className="underline-offset-4 hover:text-violet-deep hover:underline">
                {fr ? c.name.fr : c.name.en}
              </Link>
              {i < CITY_PAGES.length - 1 ? " · " : ""}
            </span>
          ))}
          <span>{fr ? " et partout en Ontario." : " and across Ontario."}</span>
        </nav>

        <p className="mt-4 text-sm text-muted">
          <Link href="/delivery" className="link-draw">
            {fr ? "Toutes les zones de livraison" : "All delivery areas"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="mx-3">·</span>
          <Link href="/shipping" className="link-draw">
            {t("link")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
