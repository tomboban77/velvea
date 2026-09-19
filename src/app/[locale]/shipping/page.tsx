import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";
import { getZonesForDisplay } from "@/lib/zones";
import { t } from "@/lib/i18n-content";

export const metadata = { title: "Delivery" };

export const dynamic = "force-dynamic";

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Read from the zones themselves. This page used to promise Canada-wide
  // shipping, free delivery over a threshold and next-day express, none of
  // which were true — a policy page that restates the configuration cannot
  // drift away from it.
  const [settings, zones] = await Promise.all([getSettings(), getZonesForDisplay()]);
  const local = zones.filter((z) => z.kind === "LOCAL");
  const shipping = zones.filter((z) => z.kind === "SHIPPING");
  const pickup = zones.find((z) => z.kind === "PICKUP");
  const sameDay = local.find((z) => z.sameDayCutoff);

  const money = (c: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(c / 100);

  return (
    <ProsePage
      eyebrow="Support"
      title="Delivery"
      intro="Where we deliver, what it costs, and how soon your gift arrives."
    >
      <h2>Where we deliver</h2>
      <p>
        We deliver throughout Ontario. Orders in Mississauga and the Greater Toronto Area
        are delivered by us directly; everywhere else in the province travels with a
        tracked courier. We do not currently deliver outside Ontario.
      </p>
      <p>
        Your delivery options and their exact cost appear at checkout as soon as you enter
        the recipient&apos;s postal code — the postal code, not the city name, is what
        determines the area, so there is no guesswork about whether an address qualifies.
      </p>

      {pickup && (
        <>
          <h2>Pickup — always free</h2>
          <p>
            Collect your order from {settings.contact.addressLine}, {settings.contact.city},{" "}
            {settings.contact.province} {settings.contact.postalCode}. There is no charge for
            pickup, and it is available for every order regardless of where you live.
          </p>
        </>
      )}

      {local.length > 0 && (
        <>
          <h2>Local delivery</h2>
          <p>We drive these ourselves:</p>
          <ul>
            {local.map((z) => (
              <li key={z.id}>
                <strong>{t(z.name, locale)}</strong> — {money(z.baseFeeCents)}
                {z.sameDayCutoff
                  ? `, same-day on orders placed before ${z.sameDayCutoff} ET`
                  : ", next available day"}
              </li>
            ))}
          </ul>
          {sameDay && (
            <p>
              Same-day delivery depends on how far we have to travel, so the cutoff is
              earlier for areas further out. Whichever applies to your address is shown at
              checkout alongside the price.
            </p>
          )}
        </>
      )}

      {shipping.length > 0 && (
        <>
          <h2>Shipping within Ontario</h2>
          <ul>
            {shipping.map((z) => (
              <li key={z.id}>
                <strong>{t(z.name, locale)}</strong> — {money(z.baseFeeCents)}, arriving in
                roughly {z.minLeadDays}–{z.maxLeadDays} business days
                {z.extraItemCents > 0 &&
                  `, plus ${money(z.extraItemCents)} for each additional basket`}
              </li>
            ))}
          </ul>
          <p>
            Shipped orders travel in a protective outer box. Transit times are estimates
            rather than guarantees: once a parcel is with the courier, the final leg is
            theirs, and remote parts of the province can take longer. If you need a gift to
            arrive on a particular day, choose local delivery or pickup where you can, and
            order with room to spare.
          </p>
        </>
      )}

      <h2>Baskets we cannot ship</h2>
      <p>
        Some baskets are too perishable to travel — anything fresh, chilled or heavy on
        chocolate. Those are marked on their product page and are available for local
        delivery and pickup only. If one is in your bag and you have entered an address we
        would have to ship to, checkout will tell you before you pay rather than after.
      </p>

      <h2>Hand-packed to order</h2>
      <p>
        Every basket is assembled after you order and finished by hand, so it arrives
        exactly as it appeared online. Orders placed after {settings.delivery.orderCutoff} ET
        begin their preparation the following day.
      </p>
    </ProsePage>
  );
}
