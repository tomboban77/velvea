import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { RECIPIENTS, labelFor } from "@/lib/nav";

export async function RecipientsRow() {
  const t = await getTranslations("recipients");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();

  return (
    <section className="bg-sand/50">
      <div className="container-x py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-2">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl sm:text-4xl">{t("title")}</h2>
          </Reveal>
          <Reveal delay={100}>
            <Link
              href="/recipients"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold"
            >
              {tCommon("browseRecipients")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {RECIPIENTS.map((r, i) => (
            <Reveal key={r.slug} delay={i * 50}>
              <Link
                href={`/recipients/${r.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-shell px-5 py-3 text-sm font-medium text-ink transition-all hover:border-ink hover:shadow-sm"
              >
                {labelFor(r, locale)}
                <ArrowRight className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
