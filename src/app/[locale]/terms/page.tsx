import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata = { title: "Terms of Service" };

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ProsePage eyebrow="Legal" title="Terms of Service" intro="These template terms govern the use of the Velvea website and the purchase of our products. Please review with legal counsel before publishing.">
      <p><em>Last updated: 2026. This is a starting template and not legal advice.</em></p>
      <h2>Orders</h2>
      <p>All orders are subject to acceptance and product availability. Prices are in Canadian dollars and include applicable taxes calculated at checkout. We reserve the right to substitute items of equal or greater value where a specific product is unavailable, maintaining the overall look and value of the basket.</p>
      <h2>Payment</h2>
      <p>Payment is processed securely at checkout. By placing an order you authorize us to charge your selected payment method for the total shown.</p>
      <h2>Delivery</h2>
      <p>Delivery timing is estimated and not guaranteed unless expressly stated. Risk of loss passes on delivery to the address provided.</p>
      <h2>Returns</h2>
      <p>Because our products are perishable and hand-packed to order, we generally cannot accept returns. If something arrives damaged or incorrect, contact us within 48 hours and we'll make it right.</p>
      <h2>Contact</h2>
      <p>Questions about these terms? Email hello@velvea.ca.</p>
    </ProsePage>
  );
}
