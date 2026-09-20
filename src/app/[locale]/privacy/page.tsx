import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";

export const metadata = {
  title: "Privacy Policy",
  description: "How Velvea collects, uses and protects personal information.",
};

const LAST_UPDATED = "September 20, 2026";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { contact } = await getSettings();
  return (
    <ProsePage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How Velvea collects, uses and protects your personal information, and the choices you have."
    >
      <p><em>Last updated: {LAST_UPDATED}</em></p>

      <h2>Who we are</h2>
      <p>
        Velvea operates velvea.ca from {contact.addressLine}, {contact.city}, {contact.province}{" "}
        {contact.postalCode}, Canada. We are responsible for the personal information we collect, and we
        handle it in line with the <em>Personal Information Protection and Electronic Documents Act</em>{" "}
        (PIPEDA) and Canada's Anti-Spam Legislation (CASL). Privacy questions go to{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>When you order:</strong> your name, email address and phone number; the recipient's name,
        delivery address and phone number; your gift message and delivery notes; and what you ordered. Your
        card details go directly to Stripe, our payment processor. We never see or store your full card
        number.
      </p>
      <p>
        <strong>When you create an account:</strong> your name, email address and a password, which we
        store only as a one-way hash. Your order history is linked to your account.
      </p>
      <p>
        <strong>When you contact us or request a quote:</strong> whatever you include in your message,
        and your company details for corporate inquiries.
      </p>
      <p>
        <strong>Automatically:</strong> your IP address and basic request details, which we use for
        security, fraud prevention and rate limiting, and anonymous, aggregated page-view statistics as
        described under Cookies below.
      </p>

      <h2>Information about gift recipients</h2>
      <p>
        When you send a gift, you give us the recipient's name, address and phone number. We use these
        only to deliver the basket and to contact the recipient about that delivery. We do not add
        recipients to any marketing list. By providing their details you confirm that you are entitled
        to share them with us for this purpose.
      </p>

      <h2>How we use your information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>prepare, deliver and support your order, and send you order-related emails such as confirmations, shipping and delivery notices;</li>
        <li>operate your account and let you see your orders;</li>
        <li>answer your questions and resolve problems;</li>
        <li>prevent fraud and protect the site;</li>
        <li>meet our legal obligations, including tax and accounting records;</li>
        <li>send occasional marketing emails, but only if you have expressly opted in. Every marketing email has an unsubscribe link, and you can opt out at any time.</li>
      </ul>
      <p>We do not sell personal information, and we do not share it with third parties for their own marketing.</p>

      <h2>Service providers</h2>
      <p>
        We rely on a small number of providers to run the store. Each receives only the information it
        needs to do its job and is bound to protect it:
      </p>
      <ul>
        <li><strong>Stripe</strong> processes payments and handles your card details.</li>
        <li><strong>Resend</strong> delivers our transactional and marketing emails.</li>
        <li><strong>Vercel</strong> hosts the website and provides cookieless analytics.</li>
        <li><strong>Neon</strong> hosts our database.</li>
        <li><strong>Cloudinary</strong> stores and serves product images.</li>
        <li>Delivery partners and couriers receive the recipient's name, address and phone number for orders they carry.</li>
      </ul>
      <p>
        Some of these providers store data in the United States. Information held there may be subject
        to the laws of that country. We choose providers with strong security practices and contractual
        privacy commitments.
      </p>

      <h2>Cookies and similar technologies</h2>
      <p>
        We keep this minimal. A secure session cookie keeps you signed in to your account. Your browser's
        local storage remembers your cart and preferences on your own device. We use Vercel Analytics,
        which measures page views without cookies and does not identify or track individual visitors
        across sites. We do not use advertising cookies or trackers.
      </p>

      <h2>How long we keep information</h2>
      <p>
        Order records are kept for seven years to meet Canadian tax and accounting requirements. Account
        information is kept until you ask us to delete your account. Contact and quote messages are kept
        for as long as needed to deal with them and for a reasonable period afterwards. Information we no
        longer need is deleted or anonymized.
      </p>

      <h2>How we protect it</h2>
      <p>
        All traffic to velvea.ca is encrypted. Passwords are hashed and never stored in plain text. Access
        to customer data inside Velvea is limited to the people who need it to fulfil orders and support
        customers. No system is perfectly secure, but if a breach ever affected your information we would
        notify you and the Privacy Commissioner as the law requires.
      </p>

      <h2>Your rights and choices</h2>
      <p>
        You can ask to see the personal information we hold about you, have it corrected, or have it
        deleted, subject to the records we are legally required to keep. You can withdraw consent to
        marketing at any time by using the unsubscribe link or emailing us. To make any request, write
        to <a href={`mailto:${contact.email}`}>{contact.email}</a>. We will respond within 30 days.
      </p>
      <p>
        If you are not satisfied with how we have handled your information, you may complain to the{" "}
        <a href="https://www.priv.gc.ca" rel="noopener noreferrer" target="_blank">
          Office of the Privacy Commissioner of Canada
        </a>.
      </p>

      <h2>Children</h2>
      <p>
        Our site is intended for adults. We do not knowingly collect personal information from anyone
        under 16, and we will delete it if we learn we have.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as our practices or the law change. The date at the top shows the
        latest revision. Significant changes will be announced on the site.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, email <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </ProsePage>
  );
}
