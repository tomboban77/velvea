import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";

const EN = {
  metaTitle: "Terms of Service",
  metaDescription: "The terms that govern purchases from Velvea and use of velvea.ca.",
  eyebrow: "Legal",
  title: "Terms of Service",
  intro: "These terms govern purchases from Velvea and use of velvea.ca. Please read them before placing an order.",
  lastUpdated: "Last updated: September 20, 2026",

  whoH: "Who we are",
  whoA: "Velvea is a gift-basket studio based at ",
  whoB: ", Canada. You can reach us at ",
  whoOr: " or ",
  whoC: ". These terms are an agreement between you and Velvea.",

  orderH: "Placing an order",
  orderP1:
    "Your order is an offer to buy. We accept it when we send the order confirmation email, and a contract is formed at that point. We may decline or cancel an order before it is prepared if an item is unavailable, a price or description was displayed in error, we suspect fraud, or the delivery address is outside the areas we serve. If we cancel an order you have paid for, we refund it in full to the original payment method.",
  orderP2:
    "You are responsible for the accuracy of the details you give us, including the recipient's name, delivery address, phone number, delivery date and gift message. Please check them before paying.",

  pricesH: "Prices, taxes and delivery fees",
  pricesP:
    "Prices are in Canadian dollars. Any applicable sales tax and the delivery or pickup fee are shown at checkout before you pay, and the total you see is the total you are charged. We may change prices at any time, but changes do not affect orders already confirmed.",

  paymentH: "Payment",
  paymentP:
    "Payment is taken in full at checkout and processed by Stripe. We never see or store your full card number. By placing an order you authorize us to charge the total shown to your chosen payment method.",

  deliveryH: "Delivery and pickup",
  deliveryP1:
    "Delivery dates and times are estimates. We do our best to meet them and are not responsible for delays caused by weather, traffic, carriers or events outside our control. Where a specific delivery window is offered at checkout, we will tell you promptly if we cannot meet it.",
  deliveryP2:
    "We deliver to the address you provide. If no one is available to receive the basket, we may leave it with a concierge, reception or neighbour, or in a safe place at the address, and delivery is complete at that point. Because our baskets are perishable, we cannot be responsible for a basket that is left as instructed and not collected promptly, or that cannot be delivered because the address or buzzer details were incorrect. A second delivery attempt may carry an additional fee.",
  deliveryP3:
    "Orders for pickup are held at our studio for 48 hours after the chosen pickup date. Risk of loss passes to you when the basket is delivered or picked up.",

  subsH: "Substitutions",
  subsP:
    "Our baskets are curated from seasonal and small-batch products. If an item is unavailable, we may substitute one of equal or greater value that keeps the basket's overall look, quality and theme.",

  foodH: "Food, allergens and dietary needs",
  foodP:
    "Product pages list what each basket contains. Many items are produced in facilities that also handle nuts, dairy, gluten, soy and other allergens, and packaging can change without notice. Please read the labels on individual items before consuming them, and tell us about any allergy when ordering so we can advise. Our descriptions are not medical or dietary advice.",

  finalH: "All sales are final",
  finalP1:
    "Our baskets are perishable and hand-packed to order for one recipient. For that reason we do not accept returns, exchanges or cancellations once an order is placed, and we do not offer refunds for a change of mind, a recipient who declines the gift, or details entered incorrectly at checkout. This policy is shown to you at checkout before you pay.",
  finalP2A:
    "If we make a mistake, we fix it. Should your basket arrive damaged, incomplete or different from what you ordered, contact us within 48 hours of delivery with a photo and we will replace it or, at our discretion, refund it. If we do not deliver your order within 30 days of the delivery date you chose, you may cancel it for a full refund. Nothing in these terms limits any rights you have under the Ontario",
  finalLaw: " Consumer Protection Act, 2002",
  finalP2B: " or other applicable law.",

  giftH: "Gift messages and content you provide",
  giftP:
    "We write your gift message by hand. We may decline to reproduce a message that is abusive, discriminatory or otherwise inappropriate, and will contact you to agree an alternative. You confirm that you have the recipient's permission to share their name, address and phone number with us for delivery.",

  accountsH: "Accounts",
  accountsP:
    "You may order as a guest or create an account. You are responsible for keeping your password confidential and for activity under your account. Tell us promptly if you believe it has been accessed without your permission.",

  siteH: "Our website and content",
  siteP:
    "The text, photographs, designs and branding on velvea.ca belong to Velvea or our licensors and may not be copied or used commercially without our written permission. We try to keep the site accurate and available, but it is provided as is and we do not guarantee uninterrupted access.",

  liabilityH: "Limitation of liability",
  liabilityP:
    "To the fullest extent permitted by law, our total liability for any claim relating to an order is limited to the amount you paid for that order, and we are not liable for indirect or consequential loss. Nothing in this section excludes liability that cannot be excluded by law.",

  lawH: "Governing law",
  lawP:
    "These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable in Ontario. Any dispute will be resolved in the courts of Ontario, without prejudice to any rights you have to bring a complaint to a consumer-protection authority.",

  changesH: "Changes to these terms",
  changesP:
    "We may update these terms from time to time. The version in force when you place an order is the one that applies to it. The date at the top shows when they were last changed.",

  contactH: "Contact",
  contactA: "Questions about these terms? Email ",
  contactB: ".",
};

const FR: typeof EN = {
  metaTitle: "Conditions d'utilisation",
  metaDescription: "Les conditions qui régissent les achats auprès de Velvea et l'utilisation de velvea.ca.",
  eyebrow: "Mentions légales",
  title: "Conditions d'utilisation",
  intro:
    "Les présentes conditions régissent les achats effectués auprès de Velvea et l'utilisation de velvea.ca. Veuillez les lire avant de passer une commande.",
  lastUpdated: "Dernière mise à jour : 20 septembre 2026",

  whoH: "Qui nous sommes",
  whoA: "Velvea est un atelier de paniers-cadeaux situé au ",
  whoB: ", Canada. Vous pouvez nous joindre à l'adresse ",
  whoOr: " ou au ",
  whoC: ". Les présentes conditions constituent une entente entre vous et Velvea.",

  orderH: "Passer une commande",
  orderP1:
    "Votre commande constitue une offre d'achat. Nous l'acceptons lorsque nous envoyons le courriel de confirmation de commande, et le contrat est formé à ce moment. Nous pouvons refuser ou annuler une commande avant sa préparation si un article n'est pas disponible, si un prix ou une description a été affiché par erreur, si nous soupçonnons une fraude ou si l'adresse de livraison se trouve hors des secteurs que nous desservons. Si nous annulons une commande que vous avez payée, nous la remboursons intégralement au mode de paiement d'origine.",
  orderP2:
    "Vous êtes responsable de l'exactitude des renseignements que vous nous fournissez, y compris le nom du destinataire, l'adresse de livraison, le numéro de téléphone, la date de livraison et le message-cadeau. Veuillez les vérifier avant de payer.",

  pricesH: "Prix, taxes et frais de livraison",
  pricesP:
    "Les prix sont en dollars canadiens. Les taxes de vente applicables et les frais de livraison ou de ramassage sont affichés à la caisse avant que vous payiez, et le total affiché est le total facturé. Nous pouvons modifier les prix à tout moment, mais ces changements ne touchent pas les commandes déjà confirmées.",

  paymentH: "Paiement",
  paymentP:
    "Le paiement est prélevé en totalité à la caisse et traité par Stripe. Nous ne voyons ni ne conservons jamais votre numéro de carte complet. En passant une commande, vous nous autorisez à débiter le total affiché sur le mode de paiement choisi.",

  deliveryH: "Livraison et ramassage",
  deliveryP1:
    "Les dates et heures de livraison sont des estimations. Nous faisons tout notre possible pour les respecter et ne sommes pas responsables des retards causés par la météo, la circulation, les transporteurs ou des événements hors de notre contrôle. Lorsqu'une plage de livraison précise est offerte à la caisse, nous vous aviserons rapidement si nous ne pouvons pas la respecter.",
  deliveryP2:
    "Nous livrons à l'adresse que vous fournissez. Si personne n'est disponible pour recevoir le panier, nous pouvons le laisser à un concierge, à la réception ou à un voisin, ou encore dans un endroit sûr à l'adresse indiquée, et la livraison est alors réputée complétée. Comme nos paniers sont périssables, nous ne pouvons être tenus responsables d'un panier laissé selon les instructions et non récupéré rapidement, ni d'un panier qui ne peut être livré parce que l'adresse ou le numéro d'interphone était incorrect. Une deuxième tentative de livraison peut entraîner des frais supplémentaires.",
  deliveryP3:
    "Les commandes à ramasser sont conservées à notre atelier pendant 48 heures après la date de ramassage choisie. Le risque de perte vous est transféré au moment où le panier est livré ou ramassé.",

  subsH: "Substitutions",
  subsP:
    "Nos paniers sont composés de produits de saison et en petites séries. Si un article n'est pas disponible, nous pouvons le remplacer par un article de valeur égale ou supérieure qui préserve l'apparence, la qualité et le thème d'ensemble du panier.",

  foodH: "Aliments, allergènes et besoins alimentaires",
  foodP:
    "Les pages de produits indiquent le contenu de chaque panier. De nombreux articles sont fabriqués dans des installations qui manipulent aussi des noix, des produits laitiers, du gluten, du soya et d'autres allergènes, et les emballages peuvent changer sans préavis. Veuillez lire les étiquettes de chaque article avant de le consommer, et informez-nous de toute allergie au moment de commander afin que nous puissions vous conseiller. Nos descriptions ne constituent pas des conseils médicaux ou diététiques.",

  finalH: "Toutes les ventes sont finales",
  finalP1:
    "Nos paniers sont périssables et emballés à la main, sur commande, pour un seul destinataire. Pour cette raison, nous n'acceptons ni retour, ni échange, ni annulation une fois la commande passée, et nous n'offrons aucun remboursement en cas de changement d'avis, de refus du cadeau par le destinataire ou de renseignements saisis incorrectement à la caisse. Cette politique vous est présentée à la caisse avant le paiement.",
  finalP2A:
    "Si nous commettons une erreur, nous la corrigeons. Si votre panier arrive endommagé, incomplet ou différent de ce que vous avez commandé, communiquez avec nous dans les 48 heures suivant la livraison en joignant une photo, et nous le remplacerons ou, à notre discrétion, le rembourserons. Si nous ne livrons pas votre commande dans les 30 jours suivant la date de livraison choisie, vous pouvez l'annuler et obtenir un remboursement complet. Rien dans les présentes conditions ne limite les droits dont vous bénéficiez en vertu de la",
  finalLaw: " Loi de 2002 sur la protection du consommateur de l'Ontario",
  finalP2B: " ou de toute autre loi applicable.",

  giftH: "Messages-cadeaux et contenu que vous fournissez",
  giftP:
    "Nous écrivons votre message-cadeau à la main. Nous pouvons refuser de reproduire un message abusif, discriminatoire ou autrement inapproprié, et nous communiquerons avec vous pour convenir d'une solution de rechange. Vous confirmez avoir la permission du destinataire de nous communiquer son nom, son adresse et son numéro de téléphone aux fins de la livraison.",

  accountsH: "Comptes",
  accountsP:
    "Vous pouvez commander en tant qu'invité ou créer un compte. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée sous votre compte. Avisez-nous rapidement si vous croyez qu'il a été utilisé sans votre permission.",

  siteH: "Notre site Web et son contenu",
  siteP:
    "Les textes, photographies, designs et éléments de marque figurant sur velvea.ca appartiennent à Velvea ou à ses concédants de licence et ne peuvent être copiés ni utilisés à des fins commerciales sans notre permission écrite. Nous nous efforçons de garder le site exact et accessible, mais il est fourni tel quel et nous ne garantissons pas un accès ininterrompu.",

  liabilityH: "Limitation de responsabilité",
  liabilityP:
    "Dans toute la mesure permise par la loi, notre responsabilité totale pour toute réclamation liée à une commande est limitée au montant que vous avez payé pour cette commande, et nous ne sommes pas responsables des pertes indirectes ou consécutives. Rien dans la présente section n'exclut une responsabilité qui ne peut être exclue par la loi.",

  lawH: "Droit applicable",
  lawP:
    "Les présentes conditions sont régies par les lois de la province de l'Ontario et les lois fédérales du Canada qui s'y appliquent. Tout litige sera réglé devant les tribunaux de l'Ontario, sans préjudice de votre droit de déposer une plainte auprès d'une autorité de protection du consommateur.",

  changesH: "Modifications des présentes conditions",
  changesP:
    "Nous pouvons mettre à jour les présentes conditions de temps à autre. La version en vigueur au moment où vous passez votre commande est celle qui s'y applique. La date figurant en haut de la page indique quand elles ont été modifiées pour la dernière fois.",

  contactH: "Nous joindre",
  contactA: "Des questions au sujet des présentes conditions? Écrivez-nous à ",
  contactB: ".",
};

const COPY = { en: EN, fr: FR };

function copyFor(locale: string) {
  return COPY[locale === "fr" ? "fr" : "en"];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = copyFor(locale);
  return pageMetadata({ locale, path: "/terms", title: c.metaTitle, description: c.metaDescription });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = copyFor(locale);
  const { contact } = await getSettings();
  return (
    <ProsePage eyebrow={c.eyebrow} title={c.title} intro={c.intro}>
      <p><em>{c.lastUpdated}</em></p>

      <h2>{c.whoH}</h2>
      <p>
        {c.whoA}
        {contact.addressLine}, {contact.city}, {contact.province} {contact.postalCode}
        {c.whoB}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        {contact.phone ? <>{c.whoOr}{contact.phone}</> : null}
        {c.whoC}
      </p>

      <h2>{c.orderH}</h2>
      <p>{c.orderP1}</p>
      <p>{c.orderP2}</p>

      <h2>{c.pricesH}</h2>
      <p>{c.pricesP}</p>

      <h2>{c.paymentH}</h2>
      <p>{c.paymentP}</p>

      <h2>{c.deliveryH}</h2>
      <p>{c.deliveryP1}</p>
      <p>{c.deliveryP2}</p>
      <p>{c.deliveryP3}</p>

      <h2>{c.subsH}</h2>
      <p>{c.subsP}</p>

      <h2>{c.foodH}</h2>
      <p>{c.foodP}</p>

      <h2>{c.finalH}</h2>
      <p>{c.finalP1}</p>
      <p>
        {c.finalP2A}
        <em>{c.finalLaw}</em>
        {c.finalP2B}
      </p>

      <h2>{c.giftH}</h2>
      <p>{c.giftP}</p>

      <h2>{c.accountsH}</h2>
      <p>{c.accountsP}</p>

      <h2>{c.siteH}</h2>
      <p>{c.siteP}</p>

      <h2>{c.liabilityH}</h2>
      <p>{c.liabilityP}</p>

      <h2>{c.lawH}</h2>
      <p>{c.lawP}</p>

      <h2>{c.changesH}</h2>
      <p>{c.changesP}</p>

      <h2>{c.contactH}</h2>
      <p>
        {c.contactA}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        {c.contactB}
      </p>
    </ProsePage>
  );
}
