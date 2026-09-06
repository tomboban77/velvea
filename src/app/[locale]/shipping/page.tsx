import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata = { title: "Shipping & Delivery" };

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ProsePage eyebrow="Support" title="Shipping & Delivery" intro="How and where we deliver your Velvea gift baskets.">
      <h2>Canada-wide shipping</h2>
      <p>We ship to every province and territory in Canada. Standard shipping is a flat rate, with free shipping on eligible orders over the threshold shown at checkout. Next-day express options are available at checkout where eligible.</p>
      <h2>Same-day delivery in the GTA</h2>
      <p>Same-day delivery is available in Mississauga and the Greater Toronto Area on eligible orders placed before the daily cutoff (4 PM by default). Local delivery options appear automatically at checkout when your recipient is in the GTA.</p>
      <h2>Hand-packed to order</h2>
      <p>Every basket is assembled after you order and finished with care, so it arrives exactly as it appeared online. You'll receive delivery updates so you can follow your gift to the door.</p>
      <h2>Delivery timing</h2>
      <p>Availability and timing may vary by product and destination. Remote areas may require additional transit time. If you have a firm delivery date, add it at checkout and we'll do our best to accommodate it.</p>
    </ProsePage>
  );
}
