import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { Mail, Phone, MapPin, Clock, Building2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageHeader } from "@/components/ui/PageHeader";
import { localBusinessJsonLd, pageMetadata, siteOrigin } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CITY_PAGES } from "@/lib/cities";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/contact",
    title: t("contactTitle"),
    description: t("contactDescription"),
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const t = await getTranslations("pdp");
  const s = await getSettings();

  const cards = [
    { icon: Mail, label: fr ? "Courriel" : "Email", value: s.contact.email, href: `mailto:${s.contact.email}` },
    { icon: Phone, label: fr ? "Téléphone" : "Phone", value: s.contact.phone, href: `tel:${s.contact.phone}` },
    // The studio is a workroom, not a shop floor: collection is by appointment only,
    // so the label says so wherever the address is published (Business Profile matches).
    { icon: MapPin, label: fr ? "Atelier (sur rendez-vous)" : "Studio (by appointment)", value: `${s.contact.addressLine}, ${s.contact.city}, ${s.contact.province}` },
    { icon: Clock, label: fr ? "Heures" : "Hours", value: s.contact.hours },
  ];

  const cities = CITY_PAGES.map((c) => ({ slug: c.slug, name: fr ? c.name.fr : c.name.en }));

  return (
    <div>
      <JsonLd
        data={localBusinessJsonLd({
          origin: siteOrigin(),
          contact: s.contact,
          mapUrl: s.social.googleBusiness,
          areaServed: cities.map((c) => c.name),
        })}
      />
      <PageHeader
        eyebrow="Contact"
        title={fr ? "Parlons cadeaux" : "Let's talk gifts"}
        lede={fr ? "Une question sur une commande, une occasion ou un projet d'entreprise ? Nous répondons sous un jour ouvrable." : "A question about an order, an occasion or a corporate project? We reply within one business day."}
        breadcrumb={[{ label: t("home"), href: "/" }, { label: "Contact", href: "/contact" }]}
      />
      <div className="container-x section-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac text-violet-deep">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted">{label}</p>
                  <p className="break-words font-semibold text-ink">{value}</p>
                </div>
              </>
            );
            return href ? (
              <a key={label} href={href} className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 card-hover">{inner}</a>
            ) : (
              <div key={label} className="flex items-center gap-4 rounded-lg border border-line bg-white p-5">{inner}</div>
            );
          })}
        </div>

        {/* The page search engines and AI tools check to confirm who we are and
            where we work: the service area and the Business Profile belong here,
            in the same words as the delivery pages and the profile itself. */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-[1.4rem] font-medium">{fr ? "Comment commander" : "How ordering works"}</h2>
            <p className="mt-3 text-muted">
              {fr
                ? "Commandez en ligne à toute heure. Dans nos zones locales, une commande passée avant l'heure limite peut être livrée le jour même ; le prix exact et les dates disponibles s'affichent au paiement dès que vous entrez le code postal. Pour modifier un panier ou en composer un sur mesure, envoyez une demande : nous répondons avec un prix final, et rien n'est facturé avant votre accord."
                : "Order online at any hour. In our local zones, an order placed before the cutoff can arrive the same day; the exact fee and the available dates show at checkout as soon as you enter the postal code. To change a basket or have one made to your list, send a request and we reply with a final price. Nothing is charged until you approve it."}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link href="/custom-basket" className="underline hover:text-violet-deep">{fr ? "Demande de panier sur mesure" : "Custom basket request"}</Link>
              <Link href="/faq" className="underline hover:text-violet-deep">{fr ? "Questions fréquentes" : "Frequently asked questions"}</Link>
              {s.social.googleBusiness && (
                <a href={s.social.googleBusiness} className="underline hover:text-violet-deep" target="_blank" rel="noopener noreferrer">
                  {fr ? "Velvéa sur Google" : "Velvéa on Google"}
                </a>
              )}
            </div>
          </section>
          <section>
            <h2 className="font-display text-[1.4rem] font-medium">{fr ? "Où nous livrons" : "Where we deliver"}</h2>
            <p className="mt-3 text-muted">
              {fr
                ? "Notre équipe livre elle-même à Mississauga et dans le Grand Toronto, et les paniers qui voyagent bien sont expédiés par messager avec suivi partout au Canada, sauf au Québec pour l'instant."
                : "Our own team delivers across Mississauga and the GTA, and baskets that travel well ship by tracked courier across Canada, except Quebec for now."}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/delivery/${c.slug}`} className="inline-block rounded border border-line bg-white px-3 py-1.5 text-sm hover:border-violet-deep">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/delivery" className="link-draw mt-4 text-sm">
              {fr ? "Zones, frais et heures limites" : "Delivery areas, fees and cutoffs"}
            </Link>
          </section>
        </div>

        <div className="band-ink mt-8 flex flex-col gap-5 rounded-lg p-7 sm:flex-row sm:items-center sm:p-9">
          <Building2 className="h-9 w-9 shrink-0 text-gold-pale" strokeWidth={1.4} />
          <div className="flex-1">
            <p className="font-display text-[1.4rem] font-medium">{fr ? "Cadeaux d'entreprise ?" : "Corporate gifting?"}</p>
            <p className="mt-1 text-white/70">{fr ? "Demandez un devis pour les commandes en volume, les cartes personnalisées et la livraison multi-adresses." : "Request a quote for volume orders, branded cards and multi-address delivery."}</p>
          </div>
          <Link href="/corporate/quote" className="btn btn-light">
            {fr ? "Demander un devis" : "Request a quote"} <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
