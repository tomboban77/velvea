import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ProsePage eyebrow="Legal" title="Privacy Policy" intro="This template describes how Velvea handles personal information. Please review it with legal counsel before publishing.">
      <p><em>Last updated: 2026. This is a starting template and not legal advice.</em></p>
      <h2>Information we collect</h2>
      <p>We collect information you provide when placing an order or creating an account, including your name, contact details, delivery addresses, and order history. Payment card details are processed securely by our payment provider and are not stored on our servers.</p>
      <h2>How we use it</h2>
      <p>We use your information to process and deliver orders, provide customer support, send transactional emails, and — with your consent — occasional marketing. We do not sell your personal information.</p>
      <h2>Your rights</h2>
      <p>Under Canadian privacy law (PIPEDA), you may request access to, correction of, or deletion of your personal information. Contact us to make a request.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies and local storage to operate the cart and remember preferences. Analytics may use additional cookies where enabled.</p>
      <h2>Contact</h2>
      <p>For privacy questions, email hello@velvea.ca.</p>
    </ProsePage>
  );
}
