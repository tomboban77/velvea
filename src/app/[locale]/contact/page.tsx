import { setRequestLocale, getLocale } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { Mail, Phone, MapPin, Clock, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const s = await getSettings();
  return (
    <div className="container-x max-w-4xl py-14">
      <p className="eyebrow mb-3">{fr ? "Contact" : "Contact"}</p>
      <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{fr ? "Parlons cadeaux" : "Let's talk gifts"}</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        {fr ? "Une question sur une commande, une occasion ou un projet d'entreprise ? Nous sommes là pour aider." : "A question about an order, an occasion, or a corporate project? We're here to help."}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${s.contact.email}`} className="flex items-center gap-4 rounded-2xl border border-line bg-shell p-5 card-hover">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-iris-soft"><Mail className="h-5 w-5 text-violet-deep" /></span>
          <div><p className="text-sm text-muted">{fr ? "Courriel" : "Email"}</p><p className="font-semibold text-ink">{s.contact.email}</p></div>
        </a>
        <a href={`tel:${s.contact.phone}`} className="flex items-center gap-4 rounded-2xl border border-line bg-shell p-5 card-hover">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-iris-soft"><Phone className="h-5 w-5 text-violet-deep" /></span>
          <div><p className="text-sm text-muted">{fr ? "Téléphone" : "Phone"}</p><p className="font-semibold text-ink">{s.contact.phone}</p></div>
        </a>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-shell p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-iris-soft"><MapPin className="h-5 w-5 text-violet-deep" /></span>
          <div><p className="text-sm text-muted">{fr ? "Adresse" : "Studio"}</p><p className="font-semibold text-ink">{s.contact.addressLine}, {s.contact.city}, {s.contact.province}</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-shell p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-iris-soft"><Clock className="h-5 w-5 text-violet-deep" /></span>
          <div><p className="text-sm text-muted">{fr ? "Heures" : "Hours"}</p><p className="font-semibold text-ink">{s.contact.hours}</p></div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-charcoal p-6 text-canvas">
        <Building2 className="h-8 w-8 text-lilac-deep" />
        <div className="flex-1">
          <p className="font-display text-xl">{fr ? "Cadeaux d'entreprise ?" : "Corporate gifting?"}</p>
          <p className="text-sm text-canvas/70">{fr ? "Demandez un devis pour les commandes en gros." : "Request a quote for bulk orders."}</p>
        </div>
        <Link href="/corporate/quote" className="btn btn-gold btn-sm">{fr ? "Devis" : "Get a quote"}</Link>
      </div>
    </div>
  );
}
