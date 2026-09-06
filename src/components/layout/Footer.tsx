import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { Newsletter } from "./Newsletter";
import { getSettings } from "@/lib/settings";
import { OCCASIONS, RECIPIENTS, labelFor } from "@/lib/nav";
import { MapPin, Mail, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/brand/SocialIcons";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const s = await getSettings();

  return (
    <footer className="mt-24 border-t border-line bg-cream">
      {/* Newsletter band */}
      <div className="border-b border-line">
        <div className="container-x grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow mb-3">Velvea</p>
            <h3 className="font-display text-3xl md:text-4xl">{t("newsletter.title")}</h3>
            <p className="mt-3 max-w-md text-ink-soft">{t("newsletter.lede")}</p>
          </div>
          <div className="md:pl-8">
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-x grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
            {t("footer.blurb")}
          </p>
          <div className="mt-6 space-y-2.5 text-sm text-ink-soft">
            <a href={`mailto:${s.contact.email}`} className="flex items-center gap-2.5 hover:text-gold">
              <Mail className="h-4 w-4 text-gold" /> {s.contact.email}
            </a>
            <a href={`tel:${s.contact.phone}`} className="flex items-center gap-2.5 hover:text-gold">
              <Phone className="h-4 w-4 text-gold" /> {s.contact.phone}
            </a>
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 text-gold" />
              {s.contact.addressLine}, {s.contact.city}, {s.contact.province}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <a href={s.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-gold hover:text-gold">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href={s.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-gold hover:text-gold">
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-sm font-semibold text-ink">{t("footer.shop")}</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/baskets" className="hover:text-gold">{t("nav.allBaskets")}</Link></li>
            <li><Link href="/custom" className="hover:text-gold">{t("footer.custom")}</Link></li>
            <li><Link href="/corporate" className="hover:text-gold">{t("footer.corporate")}</Link></li>
            <li><Link href="/gift-cards" className="hover:text-gold">{t("footer.giftCards")}</Link></li>
            <li><Link href="/deal-of-the-day" className="hover:text-gold">{t("nav.dealOfDay")}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-sm font-semibold text-ink">{t("footer.occasions")}</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            {OCCASIONS.slice(0, 6).map((o) => (
              <li key={o.slug}>
                <Link href={`/occasions/${o.slug}`} className="hover:text-gold">
                  {labelFor(o, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-sm font-semibold text-ink">{t("footer.company")}</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/about" className="hover:text-gold">{t("footer.about")}</Link></li>
            <li><Link href="/guides" className="hover:text-gold">{t("footer.guidesLink")}</Link></li>
            {RECIPIENTS.slice(0, 3).map((r) => (
              <li key={r.slug}>
                <Link href={`/recipients/${r.slug}`} className="hover:text-gold">
                  {labelFor(r, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-sm font-semibold text-ink">{t("footer.support")}</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/contact" className="hover:text-gold">{t("footer.contact")}</Link></li>
            <li><Link href="/faq" className="hover:text-gold">{t("footer.faq")}</Link></li>
            <li><Link href="/shipping" className="hover:text-gold">{t("footer.shipping")}</Link></li>
            <li><Link href="/privacy" className="hover:text-gold">{t("footer.privacy")}</Link></li>
            <li><Link href="/terms" className="hover:text-gold">{t("footer.terms")}</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Velvea. {t("footer.rights")}</p>
          <p>{t("footer.madeIn")}</p>
          <p>{t("footer.currency")}</p>
        </div>
      </div>
    </footer>
  );
}
