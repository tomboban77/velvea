import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern purchases from Velvea and use of velvea.ca.",
};

const LAST_UPDATED = "September 20, 2026";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { contact } = await getSettings();
  return (
    <ProsePage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms govern purchases from Velvea and use of velvea.ca. Please read them before placing an order."
    >
      <p><em>Last updated: {LAST_UPDATED}</em></p>

      <h2>Who we are</h2>
      <p>
        Velvea is a gift-basket studio based at {contact.addressLine}, {contact.city}, {contact.province}{" "}
        {contact.postalCode}, Canada. You can reach us at{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        {contact.phone ? <> or {contact.phone}</> : null}. These terms are an agreement between you and Velvea.
      </p>

      <h2>Placing an order</h2>
      <p>
        Your order is an offer to buy. We accept it when we send the order confirmation email, and a
        contract is formed at that point. We may decline or cancel an order before it is prepared if an
        item is unavailable, a price or description was displayed in error, we suspect fraud, or the
        delivery address is outside the areas we serve. If we cancel an order you have paid for, we
        refund it in full to the original payment method.
      </p>
      <p>
        You are responsible for the accuracy of the details you give us, including the recipient's name,
        delivery address, phone number, delivery date and gift message. Please check them before paying.
      </p>

      <h2>Prices, taxes and delivery fees</h2>
      <p>
        Prices are in Canadian dollars. Any applicable sales tax and the delivery or pickup fee are shown
        at checkout before you pay, and the total you see is the total you are charged. We may change
        prices at any time, but changes do not affect orders already confirmed.
      </p>

      <h2>Payment</h2>
      <p>
        Payment is taken in full at checkout and processed by Stripe. We never see or store your full card
        number. By placing an order you authorize us to charge the total shown to your chosen payment method.
      </p>

      <h2>Delivery and pickup</h2>
      <p>
        Delivery dates and times are estimates. We do our best to meet them and are not responsible for
        delays caused by weather, traffic, carriers or events outside our control. Where a specific
        delivery window is offered at checkout, we will tell you promptly if we cannot meet it.
      </p>
      <p>
        We deliver to the address you provide. If no one is available to receive the basket, we may leave
        it with a concierge, reception or neighbour, or in a safe place at the address, and delivery is
        complete at that point. Because our baskets are perishable, we cannot be responsible for a basket
        that is left as instructed and not collected promptly, or that cannot be delivered because the
        address or buzzer details were incorrect. A second delivery attempt may carry an additional fee.
      </p>
      <p>
        Orders for pickup are held at our studio for 48 hours after the chosen pickup date. Risk of loss
        passes to you when the basket is delivered or picked up.
      </p>

      <h2>Substitutions</h2>
      <p>
        Our baskets are curated from seasonal and small-batch products. If an item is unavailable, we may
        substitute one of equal or greater value that keeps the basket's overall look, quality and theme.
      </p>

      <h2>Food, allergens and dietary needs</h2>
      <p>
        Product pages list what each basket contains. Many items are produced in facilities that also
        handle nuts, dairy, gluten, soy and other allergens, and packaging can change without notice.
        Please read the labels on individual items before consuming them, and tell us about any allergy
        when ordering so we can advise. Our descriptions are not medical or dietary advice.
      </p>

      <h2>All sales are final</h2>
      <p>
        Our baskets are perishable and hand-packed to order for one recipient. For that reason we do not
        accept returns, exchanges or cancellations once an order is placed, and we do not offer refunds
        for a change of mind, a recipient who declines the gift, or details entered incorrectly at
        checkout. This policy is shown to you at checkout before you pay.
      </p>
      <p>
        If we make a mistake, we fix it. Should your basket arrive damaged, incomplete or different from
        what you ordered, contact us within 48 hours of delivery with a photo and we will replace it or,
        at our discretion, refund it. Nothing in these terms limits any rights you have under the Ontario
        <em> Consumer Protection Act, 2002</em> or other applicable law.
      </p>

      <h2>Gift messages and content you provide</h2>
      <p>
        We write your gift message by hand. We may decline to reproduce a message that is abusive,
        discriminatory or otherwise inappropriate, and will contact you to agree an alternative. You
        confirm that you have the recipient's permission to share their name, address and phone number
        with us for delivery.
      </p>

      <h2>Accounts</h2>
      <p>
        You may order as a guest or create an account. You are responsible for keeping your password
        confidential and for activity under your account. Tell us promptly if you believe it has been
        accessed without your permission.
      </p>

      <h2>Our website and content</h2>
      <p>
        The text, photographs, designs and branding on velvea.ca belong to Velvea or our licensors and may
        not be copied or used commercially without our written permission. We try to keep the site
        accurate and available, but it is provided as is and we do not guarantee uninterrupted access.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our total liability for any claim relating to an order is
        limited to the amount you paid for that order, and we are not liable for indirect or
        consequential loss. Nothing in this section excludes liability that cannot be excluded by law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Province of Ontario and the federal laws of Canada
        applicable in Ontario. Any dispute will be resolved in the courts of Ontario, without prejudice to
        any rights you have to bring a complaint to a consumer-protection authority.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version in force when you place an order is the
        one that applies to it. The date at the top shows when they were last changed.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </ProsePage>
  );
}
