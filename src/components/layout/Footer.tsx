import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { Ornament } from "@/components/brand/Ornament";
import { Newsletter } from "./Newsletter";
import { getSettings } from "@/lib/settings";
import { OCCASIONS, labelFor } from "@/lib/nav";
import { InstagramIcon, FacebookIcon } from "@/components/brand/SocialIcons";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const s = await getSettings();

  return (
    <footer className="mt-24 border-t border-line-strong bg-cream">
      {/* Newsletter + concierge */}
      <div className="border-b border-line">
        <div className="container-x grid gap-12 py-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="chapter">{t("brand.name")}</p>
            <Ornament className="mt-3" />
            <h3 className="h-sub mt-6">{t("newsletter.title")}</h3>
            <p className="mt-3 max-w-md text-ink-soft">{t("newsletter.lede")}</p>
            <div className="mt-6 max-w-md">
              <Newsletter />
            </div>
          </div>
          <div className="lg:border-l lg:border-line lg:pl-20">
            <p className="chapter">{t("footer.concierge")}</p>
            <Ornament className="mt-3" />
            <p className="mt-6 max-w-md text-ink-soft">{t("footer.conciergeSub")}</p>
            <dl className="mt-6 space-y-3 text-[0.98rem]">
              <div className="flex gap-4">
                <dt className="caps w-16 shrink-0 pt-1 text-[0.58rem] text-violet">Email</dt>
                <dd>
                  <a href={`mailto:${s.contact.email}`} className="font-display text-[1.15rem] text-ink hover:text-violet-deep">
                    {s.contact.email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="caps w-16 shrink-0 pt-1 text-[0.58rem] text-violet">{locale === "fr" ? "Tél." : "Phone"}</dt>
                <dd>
                  <a href={`tel:${s.contact.phone}`} className="font-display text-[1.15rem] text-ink hover:text-violet-deep">
                    {s.contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="caps w-16 shrink-0 pt-1 text-[0.58rem] text-violet">Atelier</dt>
                <dd className="text-ink-soft">
                  {s.contact.addressLine}, {s.contact.city}, {s.contact.province}
                  <br />
                  <span className="text-muted">{s.contact.hours}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo height={30} />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">{t("footer.blurb")}</p>
          <div className="mt-6 flex gap-2.5">
            <a href={s.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center border border-line-strong text-ink-soft transition-colors hover:border-violet hover:text-violet">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href={s.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center border border-line-strong text-ink-soft transition-colors hover:border-violet hover:text-violet">
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FooterCol title={t("footer.shop")}>
          <FooterLink href="/baskets">{t("nav.allBaskets")}</FooterLink>
          <FooterLink href="/custom">{t("footer.custom")}</FooterLink>
          <FooterLink href="/corporate">{t("footer.corporate")}</FooterLink>
          <FooterLink href="/gift-cards">{t("footer.giftCards")}</FooterLink>
          <FooterLink href="/recipients">{t("nav.recipients")}</FooterLink>
        </FooterCol>

        <FooterCol title={t("footer.occasions")}>
          {OCCASIONS.slice(0, 6).map((o) => (
            <FooterLink key={o.slug} href={`/occasions/${o.slug}`}>
              {labelFor(o, locale)}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title={t("footer.company")}>
          <FooterLink href="/about">{t("footer.about")}</FooterLink>
          <FooterLink href="/guides">{t("footer.guidesLink")}</FooterLink>
          <FooterLink href="/reviews">{t("footer.reviews")}</FooterLink>
          <FooterLink href="/corporate/quote">{t("nav.corporateQuote")}</FooterLink>
        </FooterCol>

        <FooterCol title={t("footer.support")}>
          <FooterLink href="/contact">{t("footer.contact")}</FooterLink>
          <FooterLink href="/faq">{t("footer.faq")}</FooterLink>
          <FooterLink href="/shipping">{t("footer.shipping")}</FooterLink>
          <FooterLink href="/privacy">{t("footer.privacy")}</FooterLink>
          <FooterLink href="/terms">{t("footer.terms")}</FooterLink>
        </FooterCol>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-[0.68rem] uppercase tracking-[0.16em] text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} Velvea · {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")}</p>
          <p>{t("footer.currency")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <p className="caps mb-5 text-[0.6rem] text-violet">{title}</p>
      <ul className="space-y-2.5 text-[0.95rem] text-ink-soft">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-violet-deep">
        {children}
      </Link>
    </li>
  );
}
