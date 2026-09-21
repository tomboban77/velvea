import { setRequestLocale } from "next-intl/server";
import { ProsePage } from "@/components/ui/ProsePage";
import { getSettings } from "@/lib/settings";

const EN = {
  metaTitle: "Privacy Policy",
  metaDescription: "How Velvea collects, uses and protects personal information.",
  eyebrow: "Legal",
  title: "Privacy Policy",
  intro: "How Velvea collects, uses and protects your personal information, and the choices you have.",
  lastUpdated: "Last updated: September 20, 2026",

  whoH: "Who we are",
  whoA: "Velvea operates velvea.ca from ",
  whoB: ", Canada. We are responsible for the personal information we collect, and we handle it in line with the ",
  whoLaw: "Personal Information Protection and Electronic Documents Act",
  whoC: " (PIPEDA) and Canada's Anti-Spam Legislation (CASL). Privacy questions go to ",
  whoD: ".",

  collectH: "What we collect",
  collectOrderL: "When you order:",
  collectOrder:
    " your name, email address and phone number; the recipient's name, delivery address and phone number; your gift message and delivery notes; and what you ordered. Your card details go directly to Stripe, our payment processor. We never see or store your full card number.",
  collectAccountL: "When you create an account:",
  collectAccount:
    " your name, email address and a password, which we store only as a one-way hash. Your order history is linked to your account.",
  collectContactL: "When you contact us or request a quote:",
  collectContact: " whatever you include in your message, and your company details for corporate inquiries.",
  collectAutoL: "Automatically:",
  collectAuto:
    " your IP address and basic request details, which we use for security, fraud prevention and rate limiting, and anonymous, aggregated page-view statistics as described under Cookies below.",

  recipientsH: "Information about gift recipients",
  recipientsP:
    "When you send a gift, you give us the recipient's name, address and phone number. We use these only to deliver the basket and to contact the recipient about that delivery. We do not add recipients to any marketing list. By providing their details you confirm that you are entitled to share them with us for this purpose.",

  useH: "How we use your information",
  useLead: "We use personal information to:",
  useItems: [
    "prepare, deliver and support your order, and send you order-related emails such as confirmations, shipping and delivery notices;",
    "operate your account and let you see your orders;",
    "answer your questions and resolve problems;",
    "prevent fraud and protect the site;",
    "meet our legal obligations, including tax and accounting records;",
    "send occasional marketing emails, but only if you have expressly opted in. Every marketing email has an unsubscribe link, and you can opt out at any time.",
  ],
  useNoSell: "We do not sell personal information, and we do not share it with third parties for their own marketing.",

  providersH: "Service providers",
  providersLead:
    "We rely on a small number of providers to run the store. Each receives only the information it needs to do its job and is bound to protect it:",
  providers: [
    { name: "Stripe", text: " processes payments and handles your card details." },
    { name: "Resend", text: " delivers our transactional and marketing emails." },
    { name: "Vercel", text: " hosts the website and provides cookieless analytics." },
    { name: "Neon", text: " hosts our database." },
    { name: "Cloudinary", text: " stores and serves product images." },
  ],
  providersCouriers:
    "Delivery partners and couriers receive the recipient's name, address and phone number for orders they carry.",
  providersUS:
    "Some of these providers store data in the United States. Information held there may be subject to the laws of that country. We choose providers with strong security practices and contractual privacy commitments.",

  cookiesH: "Cookies and similar technologies",
  cookiesP:
    "We keep this minimal. A secure session cookie keeps you signed in to your account. Your browser's local storage remembers your cart and preferences on your own device. We use Vercel Analytics, which measures page views without cookies and does not identify or track individual visitors across sites. We do not use advertising cookies or trackers.",

  retentionH: "How long we keep information",
  retentionP:
    "Order records are kept for seven years to meet Canadian tax and accounting requirements. Account information is kept until you ask us to delete your account. Contact and quote messages are kept for as long as needed to deal with them and for a reasonable period afterwards. Information we no longer need is deleted or anonymized.",

  securityH: "How we protect it",
  securityP:
    "All traffic to velvea.ca is encrypted. Passwords are hashed and never stored in plain text. Access to customer data inside Velvea is limited to the people who need it to fulfil orders and support customers. No system is perfectly secure, but if a breach ever affected your information we would notify you and the Privacy Commissioner as the law requires.",

  rightsH: "Your rights and choices",
  rightsA:
    "You can ask to see the personal information we hold about you, have it corrected, or have it deleted, subject to the records we are legally required to keep. You can withdraw consent to marketing at any time by using the unsubscribe link or emailing us. To make any request, write to ",
  rightsB: ". We will respond within 30 days.",
  complainA: "If you are not satisfied with how we have handled your information, you may complain to the ",
  complainLink: "Office of the Privacy Commissioner of Canada",
  complainB: ".",

  childrenH: "Children",
  childrenP:
    "Our site is intended for adults. We do not knowingly collect personal information from anyone under 16, and we will delete it if we learn we have.",

  changesH: "Changes to this policy",
  changesP:
    "We may update this policy as our practices or the law change. The date at the top shows the latest revision. Significant changes will be announced on the site.",

  contactH: "Contact",
  contactA: "For privacy questions or requests, email ",
  contactB: ".",
};

const FR: typeof EN = {
  metaTitle: "Politique de confidentialité",
  metaDescription: "Comment Velvea recueille, utilise et protège les renseignements personnels.",
  eyebrow: "Mentions légales",
  title: "Politique de confidentialité",
  intro:
    "Comment Velvea recueille, utilise et protège vos renseignements personnels, et les choix qui s'offrent à vous.",
  lastUpdated: "Dernière mise à jour : 20 septembre 2026",

  whoH: "Qui nous sommes",
  whoA: "Velvea exploite velvea.ca depuis le ",
  whoB:
    ", Canada. Nous sommes responsables des renseignements personnels que nous recueillons et nous les traitons conformément à la ",
  whoLaw: "Loi sur la protection des renseignements personnels et les documents électroniques",
  whoC:
    " (LPRPDE) et à la Loi canadienne anti-pourriel (LCAP). Les questions relatives à la confidentialité peuvent être adressées à ",
  whoD: ".",

  collectH: "Ce que nous recueillons",
  collectOrderL: "Lorsque vous commandez :",
  collectOrder:
    " votre nom, votre adresse courriel et votre numéro de téléphone; le nom, l'adresse de livraison et le numéro de téléphone du destinataire; votre message-cadeau et vos consignes de livraison; et le contenu de votre commande. Les données de votre carte sont transmises directement à Stripe, notre processeur de paiement. Nous ne voyons ni ne conservons jamais votre numéro de carte complet.",
  collectAccountL: "Lorsque vous créez un compte :",
  collectAccount:
    " votre nom, votre adresse courriel et un mot de passe, que nous conservons uniquement sous forme de hachage à sens unique. Votre historique de commandes est lié à votre compte.",
  collectContactL: "Lorsque vous nous contactez ou demandez un devis :",
  collectContact:
    " tout ce que vous incluez dans votre message, ainsi que les coordonnées de votre entreprise pour les demandes d'entreprises.",
  collectAutoL: "Automatiquement :",
  collectAuto:
    " votre adresse IP et les détails de base de la requête, que nous utilisons à des fins de sécurité, de prévention de la fraude et de limitation du débit, ainsi que des statistiques de consultation de pages anonymes et agrégées, comme décrit à la section Témoins ci-dessous.",

  recipientsH: "Renseignements sur les destinataires de cadeaux",
  recipientsP:
    "Lorsque vous envoyez un cadeau, vous nous fournissez le nom, l'adresse et le numéro de téléphone du destinataire. Nous les utilisons uniquement pour livrer le panier et pour communiquer avec le destinataire au sujet de cette livraison. Nous n'ajoutons pas les destinataires à une liste de marketing. En fournissant leurs coordonnées, vous confirmez que vous êtes autorisé à les partager avec nous à cette fin.",

  useH: "Comment nous utilisons vos renseignements",
  useLead: "Nous utilisons les renseignements personnels pour :",
  useItems: [
    "préparer, livrer et assurer le suivi de votre commande, et vous envoyer des courriels liés à la commande, comme les confirmations et les avis d'expédition et de livraison;",
    "gérer votre compte et vous permettre de consulter vos commandes;",
    "répondre à vos questions et résoudre les problèmes;",
    "prévenir la fraude et protéger le site;",
    "respecter nos obligations légales, y compris la tenue de registres fiscaux et comptables;",
    "vous envoyer occasionnellement des courriels de marketing, mais seulement si vous y avez expressément consenti. Chaque courriel de marketing contient un lien de désabonnement, et vous pouvez retirer votre consentement à tout moment.",
  ],
  useNoSell:
    "Nous ne vendons pas de renseignements personnels et nous ne les partageons pas avec des tiers à leurs propres fins de marketing.",

  providersH: "Fournisseurs de services",
  providersLead:
    "Nous faisons appel à un petit nombre de fournisseurs pour exploiter la boutique. Chacun ne reçoit que les renseignements nécessaires à l'exécution de sa tâche et est tenu de les protéger :",
  providers: [
    { name: "Stripe", text: " traite les paiements et gère les données de votre carte." },
    { name: "Resend", text: " achemine nos courriels transactionnels et de marketing." },
    { name: "Vercel", text: " héberge le site Web et fournit des analyses sans témoins." },
    { name: "Neon", text: " héberge notre base de données." },
    { name: "Cloudinary", text: " stocke et diffuse les images de produits." },
  ],
  providersCouriers:
    "Les partenaires de livraison et les messagers reçoivent le nom, l'adresse et le numéro de téléphone du destinataire pour les commandes qu'ils transportent.",
  providersUS:
    "Certains de ces fournisseurs stockent des données aux États-Unis. Les renseignements qui y sont conservés peuvent être assujettis aux lois de ce pays. Nous choisissons des fournisseurs ayant des pratiques de sécurité rigoureuses et des engagements contractuels en matière de confidentialité.",

  cookiesH: "Témoins (cookies) et technologies similaires",
  cookiesP:
    "Nous en faisons un usage minimal. Un témoin de session sécurisé vous garde connecté à votre compte. Le stockage local de votre navigateur mémorise votre panier et vos préférences sur votre propre appareil. Nous utilisons Vercel Analytics, qui mesure les consultations de pages sans témoins et n'identifie ni ne suit les visiteurs individuels d'un site à l'autre. Nous n'utilisons aucun témoin publicitaire ni traceur.",

  retentionH: "Durée de conservation des renseignements",
  retentionP:
    "Les dossiers de commande sont conservés pendant sept ans afin de respecter les exigences fiscales et comptables canadiennes. Les renseignements de compte sont conservés jusqu'à ce que vous nous demandiez de supprimer votre compte. Les messages de contact et les demandes de devis sont conservés aussi longtemps que nécessaire pour y donner suite, puis pendant une période raisonnable. Les renseignements dont nous n'avons plus besoin sont supprimés ou anonymisés.",

  securityH: "Comment nous les protégeons",
  securityP:
    "Tout le trafic vers velvea.ca est chiffré. Les mots de passe sont hachés et ne sont jamais stockés en clair. Au sein de Velvea, l'accès aux données des clients est limité aux personnes qui en ont besoin pour exécuter les commandes et servir la clientèle. Aucun système n'est parfaitement sécurisé, mais si une atteinte touchait un jour vos renseignements, nous vous en aviserions ainsi que le Commissariat à la protection de la vie privée, comme la loi l'exige.",

  rightsH: "Vos droits et vos choix",
  rightsA:
    "Vous pouvez demander à consulter les renseignements personnels que nous détenons à votre sujet, à les faire corriger ou à les faire supprimer, sous réserve des dossiers que la loi nous oblige à conserver. Vous pouvez retirer votre consentement au marketing à tout moment en utilisant le lien de désabonnement ou en nous écrivant. Pour toute demande, écrivez à ",
  rightsB: ". Nous répondrons dans un délai de 30 jours.",
  complainA:
    "Si vous n'êtes pas satisfait de la façon dont nous avons traité vos renseignements, vous pouvez déposer une plainte auprès du ",
  complainLink: "Commissariat à la protection de la vie privée du Canada",
  complainB: ".",

  childrenH: "Enfants",
  childrenP:
    "Notre site s'adresse aux adultes. Nous ne recueillons pas sciemment de renseignements personnels auprès de personnes de moins de 16 ans, et nous les supprimerons si nous apprenons que nous l'avons fait.",

  changesH: "Modifications de la présente politique",
  changesP:
    "Nous pouvons mettre à jour la présente politique à mesure que nos pratiques ou la loi évoluent. La date figurant en haut de la page indique la dernière révision. Les changements importants seront annoncés sur le site.",

  contactH: "Nous joindre",
  contactA: "Pour toute question ou demande relative à la confidentialité, écrivez à ",
  contactB: ".",
};

const COPY = { en: EN, fr: FR };

function copyFor(locale: string) {
  return COPY[locale === "fr" ? "fr" : "en"];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = copyFor(locale);
  return { title: c.metaTitle, description: c.metaDescription };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = copyFor(locale);
  const { contact } = await getSettings();
  const email = <a href={`mailto:${contact.email}`}>{contact.email}</a>;
  return (
    <ProsePage eyebrow={c.eyebrow} title={c.title} intro={c.intro}>
      <p><em>{c.lastUpdated}</em></p>

      <h2>{c.whoH}</h2>
      <p>
        {c.whoA}
        {contact.addressLine}, {contact.city}, {contact.province} {contact.postalCode}
        {c.whoB}
        <em>{c.whoLaw}</em>
        {c.whoC}
        {email}
        {c.whoD}
      </p>

      <h2>{c.collectH}</h2>
      <p>
        <strong>{c.collectOrderL}</strong>
        {c.collectOrder}
      </p>
      <p>
        <strong>{c.collectAccountL}</strong>
        {c.collectAccount}
      </p>
      <p>
        <strong>{c.collectContactL}</strong>
        {c.collectContact}
      </p>
      <p>
        <strong>{c.collectAutoL}</strong>
        {c.collectAuto}
      </p>

      <h2>{c.recipientsH}</h2>
      <p>{c.recipientsP}</p>

      <h2>{c.useH}</h2>
      <p>{c.useLead}</p>
      <ul>
        {c.useItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{c.useNoSell}</p>

      <h2>{c.providersH}</h2>
      <p>{c.providersLead}</p>
      <ul>
        {c.providers.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong>
            {p.text}
          </li>
        ))}
        <li>{c.providersCouriers}</li>
      </ul>
      <p>{c.providersUS}</p>

      <h2>{c.cookiesH}</h2>
      <p>{c.cookiesP}</p>

      <h2>{c.retentionH}</h2>
      <p>{c.retentionP}</p>

      <h2>{c.securityH}</h2>
      <p>{c.securityP}</p>

      <h2>{c.rightsH}</h2>
      <p>
        {c.rightsA}
        {email}
        {c.rightsB}
      </p>
      <p>
        {c.complainA}
        <a href="https://www.priv.gc.ca" rel="noopener noreferrer" target="_blank">
          {c.complainLink}
        </a>
        {c.complainB}
      </p>

      <h2>{c.childrenH}</h2>
      <p>{c.childrenP}</p>

      <h2>{c.changesH}</h2>
      <p>{c.changesP}</p>

      <h2>{c.contactH}</h2>
      <p>
        {c.contactA}
        {email}
        {c.contactB}
      </p>
    </ProsePage>
  );
}
