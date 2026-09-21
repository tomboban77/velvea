import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";
import { getZonesForDisplay } from "@/lib/zones";
import { t } from "@/lib/i18n-content";

const EN = {
  metaTitle: "Delivery",
  eyebrow: "Support",
  title: "Delivery",
  intro: "Where we deliver, what it costs, and how soon your gift arrives.",

  whereH: "Where we deliver",
  whereP1:
    "We deliver throughout Ontario. Orders in Mississauga and the Greater Toronto Area are delivered by us directly; everywhere else in the province travels with a tracked courier. We do not currently deliver outside Ontario.",
  whereP2:
    "Your delivery options and their exact cost appear at checkout as soon as you enter the recipient's postal code — the postal code, not the city name, is what determines the area, so there is no guesswork about whether an address qualifies.",

  pickupH: "Pickup — always free",
  pickupA: "Collect your order from ",
  pickupB: ". There is no charge for pickup, and it is available for every order regardless of where you live.",

  localH: "Local delivery",
  localLead: "We drive these ourselves:",
  localSameDay: (cutoff: string) => `, same-day on orders placed before ${cutoff} ET`,
  localNextDay: ", next available day",
  localNote:
    "Same-day delivery depends on how far we have to travel, so the cutoff is earlier for areas further out. Whichever applies to your address is shown at checkout alongside the price.",

  shipH: "Shipping within Ontario",
  shipArriving: (min: number, max: number) => `, arriving in roughly ${min}–${max} business days`,
  shipExtra: (fee: string) => `, plus ${fee} for each additional basket`,
  shipP:
    "Shipped orders travel in a protective outer box. Transit times are estimates rather than guarantees: once a parcel is with the courier, the final leg is theirs, and remote parts of the province can take longer. If you need a gift to arrive on a particular day, choose local delivery or pickup where you can, and order with room to spare.",

  noShipH: "Baskets we cannot ship",
  noShipP:
    "Some baskets are too perishable to travel — anything fresh, chilled or heavy on chocolate. Those are marked on their product page and are available for local delivery and pickup only. If one is in your bag and you have entered an address we would have to ship to, checkout will tell you before you pay rather than after.",

  handH: "Hand-packed to order",
  handA:
    "Every basket is assembled after you order and finished by hand, so it arrives exactly as it appeared online. Orders placed after ",
  handB: " ET begin their preparation the following day.",

  finalH: "All sales are final",
  finalP:
    "Because each basket is perishable and made for one recipient, we cannot accept returns, exchanges or cancellations once an order is placed. If a basket arrives damaged, incomplete or not as ordered, write to us within 48 hours of delivery with a photo and we will make it right.",
};

const FR: typeof EN = {
  metaTitle: "Livraison",
  eyebrow: "Soutien",
  title: "Livraison",
  intro: "Où nous livrons, ce que cela coûte et quand votre cadeau arrive.",

  whereH: "Où nous livrons",
  whereP1:
    "Nous livrons partout en Ontario. Les commandes à Mississauga et dans la région du Grand Toronto sont livrées directement par nous; partout ailleurs dans la province, elles voyagent avec un messager offrant le suivi. Nous ne livrons pas actuellement à l'extérieur de l'Ontario.",
  whereP2:
    "Vos options de livraison et leur coût exact s'affichent à la caisse dès que vous saisissez le code postal du destinataire — c'est le code postal, et non le nom de la ville, qui détermine le secteur, de sorte qu'il n'y a aucune incertitude quant à l'admissibilité d'une adresse.",

  pickupH: "Ramassage — toujours gratuit",
  pickupA: "Récupérez votre commande au ",
  pickupB: ". Le ramassage est sans frais et offert pour toutes les commandes, peu importe où vous habitez.",

  localH: "Livraison locale",
  localLead: "Nous les livrons nous-mêmes :",
  localSameDay: (cutoff: string) => `, le jour même pour les commandes passées avant ${cutoff} (HE)`,
  localNextDay: ", le prochain jour disponible",
  localNote:
    "La livraison le jour même dépend de la distance à parcourir, de sorte que l'heure limite est plus tôt pour les secteurs plus éloignés. Celle qui s'applique à votre adresse est indiquée à la caisse, à côté du prix.",

  shipH: "Expédition en Ontario",
  shipArriving: (min: number, max: number) => `, livraison en environ ${min} à ${max} jours ouvrables`,
  shipExtra: (fee: string) => `, plus ${fee} pour chaque panier supplémentaire`,
  shipP:
    "Les commandes expédiées voyagent dans une boîte extérieure protectrice. Les délais de transit sont des estimations et non des garanties : une fois le colis confié au messager, la dernière étape lui appartient, et les régions éloignées de la province peuvent prendre plus de temps. Si un cadeau doit arriver un jour précis, choisissez la livraison locale ou le ramassage lorsque c'est possible, et commandez avec une bonne marge.",

  noShipH: "Paniers que nous ne pouvons pas expédier",
  noShipP:
    "Certains paniers sont trop périssables pour voyager — tout ce qui est frais, réfrigéré ou riche en chocolat. Ils sont indiqués comme tels sur leur page de produit et sont offerts uniquement pour la livraison locale et le ramassage. Si l'un d'eux est dans votre sac et que vous avez saisi une adresse vers laquelle nous devrions expédier, la caisse vous en avisera avant le paiement, et non après.",

  handH: "Emballé à la main, sur commande",
  handA:
    "Chaque panier est assemblé après votre commande et fini à la main, de sorte qu'il arrive exactement tel qu'il apparaissait en ligne. Les commandes passées après ",
  handB: " (HE) commencent leur préparation le jour suivant.",

  finalH: "Toutes les ventes sont finales",
  finalP:
    "Comme chaque panier est périssable et confectionné pour un seul destinataire, nous ne pouvons accepter ni retour, ni échange, ni annulation une fois la commande passée. Si un panier arrive endommagé, incomplet ou non conforme à la commande, écrivez-nous dans les 48 heures suivant la livraison en joignant une photo, et nous corrigerons la situation.",
};

const COPY = { en: EN, fr: FR };

function copyFor(locale: string) {
  return COPY[locale === "fr" ? "fr" : "en"];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: copyFor(locale).metaTitle };
}

export const dynamic = "force-dynamic";

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = copyFor(locale);

  // Read from the zones themselves. This page used to promise Canada-wide
  // shipping, free delivery over a threshold and next-day express, none of
  // which were true — a policy page that restates the configuration cannot
  // drift away from it.
  const [settings, zones] = await Promise.all([getSettings(), getZonesForDisplay()]);
  const local = zones.filter((z) => z.kind === "LOCAL");
  const shipping = zones.filter((z) => z.kind === "SHIPPING");
  const pickup = zones.find((z) => z.kind === "PICKUP");
  const sameDay = local.find((z) => z.sameDayCutoff);

  const money = (cents: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);

  return (
    <ProsePage eyebrow={c.eyebrow} title={c.title} intro={c.intro}>
      <h2>{c.whereH}</h2>
      <p>{c.whereP1}</p>
      <p>{c.whereP2}</p>

      {pickup && (
        <>
          <h2>{c.pickupH}</h2>
          <p>
            {c.pickupA}
            {settings.contact.addressLine}, {settings.contact.city}, {settings.contact.province}{" "}
            {settings.contact.postalCode}
            {c.pickupB}
          </p>
        </>
      )}

      {local.length > 0 && (
        <>
          <h2>{c.localH}</h2>
          <p>{c.localLead}</p>
          <ul>
            {local.map((z) => (
              <li key={z.id}>
                <strong>{t(z.name, locale)}</strong> — {money(z.baseFeeCents)}
                {z.sameDayCutoff ? c.localSameDay(z.sameDayCutoff) : c.localNextDay}
              </li>
            ))}
          </ul>
          {sameDay && <p>{c.localNote}</p>}
        </>
      )}

      {shipping.length > 0 && (
        <>
          <h2>{c.shipH}</h2>
          <ul>
            {shipping.map((z) => (
              <li key={z.id}>
                <strong>{t(z.name, locale)}</strong> — {money(z.baseFeeCents)}
                {c.shipArriving(z.minLeadDays, z.maxLeadDays)}
                {z.extraItemCents > 0 && c.shipExtra(money(z.extraItemCents))}
              </li>
            ))}
          </ul>
          <p>{c.shipP}</p>
        </>
      )}

      <h2>{c.noShipH}</h2>
      <p>{c.noShipP}</p>

      <h2>{c.handH}</h2>
      <p>
        {c.handA}
        {settings.delivery.orderCutoff}
        {c.handB}
      </p>

      <h2>{c.finalH}</h2>
      <p>{c.finalP}</p>
    </ProsePage>
  );
}
