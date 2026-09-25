import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { Mail, Phone, MapPin, Clock, Building2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo";

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

  return (
    <div>
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
