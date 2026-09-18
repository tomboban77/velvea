import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Newsletter } from "./Newsletter";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getSettings } from "@/lib/settings";
import { OCCASIONS, RECIPIENTS, labelFor } from "@/lib/nav";
import { InstagramIcon, FacebookIcon } from "@/components/brand/SocialIcons";
import { GIFT_CARDS_ENABLED } from "@/lib/features";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const s = await getSettings();
  const fr = locale === "fr";

  return (
    <footer className="store-footer">
      {/* Newsletter band */}
      <div className="band-plum">
        <div className="container-x grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-14">
          <div>
            <p className="caps text-gold-pale">{t("footer.newsletterEyebrow")}</p>
            <h2 className="h-section mt-3 text-white">{t("newsletter.title")}</h2>
            <p className="mt-3 max-w-lg text-white/75">{t("newsletter.lede")}</p>
          </div>
          <div className="lg:justify-self-end lg:w-full lg:max-w-xl">
            <Newsletter tone="dark" />
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] xl:gap-x-10">
        <div className="col-span-2 md:col-span-4 xl:col-span-1">
          <Logo height={34} />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">{t("footer.blurb")}</p>
          <ul className="mt-6 space-y-2.5 text-[0.93rem]">
            <li className="flex items-center gap-3 text-ink-soft">
              <Mail className="h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.7} />
              <a href={`mailto:${s.contact.email}`} className="hover:text-violet-deep">{s.contact.email}</a>
            </li>
            <li className="flex items-center gap-3 text-ink-soft">
              <Phone className="h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.7} />
              <a href={`tel:${s.contact.phone}`} className="hover:text-violet-deep">{s.contact.phone}</a>
            </li>
            <li className="flex items-start gap-3 text-ink-soft">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-violet-deep" strokeWidth={1.7} />
              <span>
                {s.contact.addressLine}, {s.contact.city}, {s.contact.province}
                <br />
                <span className="text-muted">{s.contact.hours}</span>
              </span>
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            <a href={s.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-violet-deep hover:bg-violet-deep hover:text-white">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href={s.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-violet-deep hover:bg-violet-deep hover:text-white">
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FooterCol title={t("footer.shop")}>
          <FooterLink href="/baskets">{t("nav.allBaskets")}</FooterLink>
          <FooterLink href="/occasions">{t("nav.occasions")}</FooterLink>
          <FooterLink href="/recipients">{t("nav.recipients")}</FooterLink>
          <FooterLink href="/category">{t("nav.category")}</FooterLink>
          <FooterLink href="/custom">{t("footer.custom")}</FooterLink>
          <FooterLink href="/corporate">{t("footer.corporate")}</FooterLink>
          {GIFT_CARDS_ENABLED && <FooterLink href="/gift-cards">{t("footer.giftCards")}</FooterLink>}
        </FooterCol>

        <FooterCol title={t("footer.occasions")}>
          {OCCASIONS.slice(0, 7).map((o) => (
            <FooterLink key={o.slug} href={`/occasions/${o.slug}`}>{labelFor(o, locale)}</FooterLink>
          ))}
        </FooterCol>

        <FooterCol title={t("nav.recipients")}>
          {RECIPIENTS.slice(0, 7).map((r) => (
            <FooterLink key={r.slug} href={`/recipients/${r.slug}`}>{labelFor(r, locale)}</FooterLink>
          ))}
        </FooterCol>

        <FooterCol title={t("footer.support")}>
          <FooterLink href="/contact">{t("footer.contact")}</FooterLink>
          <FooterLink href="/shipping">{t("footer.shipping")}</FooterLink>
          <FooterLink href="/faq">{t("footer.faq")}</FooterLink>
          <FooterLink href="/corporate/quote">{t("nav.corporateQuote")}</FooterLink>
          <FooterLink href="/about">{t("footer.about")}</FooterLink>
          <FooterLink href="/guides">{t("footer.guidesLink")}</FooterLink>
          <FooterLink href="/reviews">{t("footer.reviews")}</FooterLink>
          <FooterLink href="/account">{t("nav.account")}</FooterLink>
        </FooterCol>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line-strong/60">
        <div className="container-x flex flex-col gap-4 py-5 text-[0.8rem] text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Velvéa · {t("footer.rights")} · {t("footer.madeIn")}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-violet-deep" strokeWidth={1.7} /> {t("footer.secure")}
            </span>
            <Link href="/privacy" className="hover:text-ink">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-ink">{t("footer.terms")}</Link>
            <span>{fr ? "Canada · CAD" : t("footer.currency")}</span>
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="footer-heading">{title}</p>
      <ul>{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-link">{children}</Link>
    </li>
  );
}
