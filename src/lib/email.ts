import "server-only";
import { Resend } from "resend";
import { formatMoney } from "./utils";
import { escapeHtml, escapeHtmlMultiline } from "./html";
import { formatStoreDate } from "./dates";
import { siteUrl } from "./env";
import { orderUrl } from "./tokens";
import { getSettings, type SiteSettings } from "./settings";

const FROM = process.env.EMAIL_FROM || "Velvea <hello@velvea.ca>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || process.env.ORDER_NOTIFY_EMAIL || "";
const SITE = siteUrl();

/**
 * Placeholder that `shell()` leaves in the footer. `shell()` is synchronous
 * and called from every template, so the business identification (name,
 * mailing address, phone, email — required on commercial email by CASL and on
 * order confirmations by Ontario's consumer regulation) is filled in by
 * `send()`, which can await the DB-backed settings.
 */
const FOOTER_TOKEN = "{{VELVEA_FOOTER}}";

function footerHtml(settings: SiteSettings): string {
  const c = settings.contact;
  const address = `${escapeHtml(c.addressLine)}, ${escapeHtml(c.city)}, ${escapeHtml(c.province)} ${escapeHtml(
    c.postalCode
  )}`;
  const email = escapeHtml(c.email);
  return `Velvea · ${address} · ${escapeHtml(c.phone)} · <a href="mailto:${email}" style="color:#8a8072">${email}</a> · <a href="${SITE}" style="color:#b0894e">velvea.ca</a>`;
}

/** Every customer-facing string lives here so EN and FR stay in step. */
type Lang = "en" | "fr";
const isFr = (locale?: string | null): boolean => (locale ?? "en").startsWith("fr");
const lang = (locale?: string | null): Lang => (isFr(locale) ? "fr" : "en");

function pick(locale: string | null | undefined, en: string, fr: string): string {
  return isFr(locale) ? fr : en;
}

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/** Strip a "Name <addr>" wrapper down to the bare address. */
function bareAddress(value: string): string {
  const match = /<([^>]+)>/.exec(value);
  return (match ? match[1] : value).trim();
}

/**
 * Returns true only when Resend accepted the message. The Resend SDK reports
 * API rejections (unverified domain, bad from-address, restricted key…) in the
 * resolved `error` field rather than by throwing, so that has to be checked
 * explicitly or a refused email disappears without a trace.
 */
async function send(
  to: string,
  subject: string,
  html: string,
  headers?: Record<string, string>
): Promise<boolean> {
  // Never throws: getSettings falls back to defaults when the DB is unreachable.
  const settings = await getSettings();
  html = html.split(FOOTER_TOKEN).join(footerHtml(settings));
  const resend = client();
  if (!resend) {
    console.log(`\n[email not sent - RESEND_API_KEY missing]\n  to: ${to}\n  subject: ${subject}\n`);
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(REPLY_TO ? { replyTo: bareAddress(REPLY_TO) } : {}),
      ...(headers ? { headers } : {}),
    });
    if (error) {
      console.error(
        `Email send rejected (${error.name}${error.statusCode ? ` ${error.statusCode}` : ""}): ${error.message}`,
        { from: FROM, to, subject }
      );
      return false;
    }
    console.log(`[email sent] id=${data?.id ?? "?"} to=${to} subject="${subject}"`);
    return true;
  } catch (err) {
    console.error("Email send failed:", err, { from: FROM, to, subject });
    return false;
  }
}

function adminRecipient(): string {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_FROM || "";
  return to ? bareAddress(to) : "";
}

/**
 * Something went wrong with money or a webhook and a person needs to look.
 * Goes to the order-notification inbox. Never throws: an alert failing must
 * not take down the code path that raised it.
 */
export async function sendOwnerAlert(subject: string, text: string, adminPath?: string): Promise<boolean> {
  const to = adminRecipient();
  if (!to) {
    console.error(`[alert not sent - no ORDER_NOTIFY_EMAIL] ${subject}: ${text}`);
    return false;
  }
  try {
    const body = `<p style="color:#514a40">${escapeHtmlMultiline(text)}</p>${
      adminPath ? `<p><a href="${escapeHtml(`${SITE}${adminPath}`)}">Open in admin</a></p>` : ""
    }`;
    return await send(to, `[Velvea alert] ${subject}`, shell(subject, body, "en"));
  } catch (err) {
    console.error("[alert] failed:", err);
    return false;
  }
}

function shell(title: string, body: string, locale?: string | null, footerExtra = ""): string {
  return `<!doctype html><html lang="${lang(locale)}"><body style="margin:0;background:#fbf8f2;font-family:Helvetica,Arial,sans-serif;color:#211b15">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="text-align:center;padding:8px 0 20px">
      <span style="font-size:22px;letter-spacing:4px;font-weight:700;background:linear-gradient(90deg,#c9a86c,#b0894e);-webkit-background-clip:text;background-clip:text;color:#b0894e">VELVÉA</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e8dfcf;border-radius:20px;padding:28px">
      <h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(title)}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#8a8072;font-size:12px;margin-top:20px">
      ${FOOTER_TOKEN}${footerExtra}
    </p>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin-top:20px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#211b15;color:#f7f2e8;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a></p>`;
}

// ---------------------------------------------------------------------------
// Order emails
// ---------------------------------------------------------------------------

export type OrderEmailAddress = {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  postalCode: string;
  country?: string | null;
  phone?: string | null;
};

export type OrderEmailItem = {
  name: string;
  variantLabel?: string | null;
  quantity: number;
  unitPriceCents: number;
  isCustom?: boolean;
  /** Localized names of the add-ons inside a custom basket. */
  customItems?: string[];
  /** The card written for this basket specifically. */
  giftMessage?: string | null;
  /** Per-unit fee for the store greeting card upgrade; 0 or unset for the free card. */
  cardFeeCents?: number | null;
};

export type OrderEmailData = {
  orderNumber: string;
  email: string;
  locale?: string | null;
  phone?: string | null;
  items: OrderEmailItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  discountCode?: string | null;
  deliveryMethod?: "SHIPPING" | "LOCAL_SAMEDAY" | "LOCAL_STANDARD" | "PICKUP" | null;
  deliveryDate?: Date | string | null;
  deliveryNotes?: string | null;
  shipping: OrderEmailAddress;
  giftMessage?: string | null;
};

function methodLabel(method: OrderEmailData["deliveryMethod"], locale?: string | null): string {
  switch (method) {
    case "LOCAL_SAMEDAY":
      return pick(locale, "Same-day local delivery", "Livraison locale le jour même");
    case "LOCAL_STANDARD":
      return pick(locale, "Local delivery", "Livraison locale");
    case "PICKUP":
      return pick(locale, "Pickup at our studio", "Ramassage à notre atelier");
    default:
      return pick(locale, "Shipping within Ontario", "Expédition en Ontario");
  }
}

function itemRows(items: OrderEmailItem[], locale?: string | null): string {
  const money = (c: number) => formatMoney(c, isFr(locale) ? "fr-CA" : "en-CA");
  return items
    .map((i) => {
      const detail: string[] = [];
      if (i.variantLabel) detail.push(escapeHtml(i.variantLabel));
      if (i.isCustom && i.customItems?.length) detail.push(escapeHtml(i.customItems.join(", ")));
      const sub = detail.length
        ? `<br><span style="color:#8a8072;font-size:12px">${detail.join(" · ")}</span>`
        : "";
      const card = i.giftMessage
        ? `<br><span style="color:#514a40;font-size:12px;font-style:italic">&ldquo;${escapeHtmlMultiline(
            i.giftMessage
          )}&rdquo;</span>`
        : "";
      const fee = i.cardFeeCents ?? 0;
      const premium = fee > 0
        ? `<br><span style="color:#6d288f;font-size:12px">${escapeHtml(
            pick(locale, "Premium greeting card", "Carte de vœux premium")
          )} · +${money(fee)}</span>`
        : "";
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e7d6">${escapeHtml(i.name)} × ${i.quantity}${sub}${card}${premium}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e7d6;text-align:right;vertical-align:top">${money(
          (i.unitPriceCents + fee) * i.quantity
        )}</td></tr>`;
    })
    .join("");
}

function totalsTable(data: OrderEmailData): string {
  const money = (c: number) => formatMoney(c, isFr(data.locale) ? "fr-CA" : "en-CA");
  const L = (en: string, fr: string) => escapeHtml(pick(data.locale, en, fr));
  const discountRow = data.discountCents
    ? `<tr><td style="color:#8a8072;padding:2px 0">${L("Discount", "Rabais")}${
        data.discountCode ? ` (${escapeHtml(data.discountCode)})` : ""
      }</td><td style="text-align:right;color:#3f7d5b">−${money(data.discountCents)}</td></tr>`
    : "";
  const shippingValue = data.shippingCents ? money(data.shippingCents) : L("Free", "Gratuite");
  // Omitted entirely at zero: we are not registered to collect GST/HST, and a
  // "Tax $0.00" line on a receipt implies we are.
  const taxRow =
    data.taxCents > 0
      ? `<tr><td style="color:#8a8072;padding:2px 0">${L("Tax", "Taxes")}</td><td style="text-align:right">${money(
          data.taxCents
        )}</td></tr>`
      : "";
  return `<table style="width:100%;font-size:14px;margin-top:12px">
      <tr><td style="color:#8a8072;padding:2px 0">${L("Subtotal", "Sous-total")}</td><td style="text-align:right">${money(
        data.subtotalCents
      )}</td></tr>
      ${discountRow}
      <tr><td style="color:#8a8072;padding:2px 0">${L("Shipping", "Livraison")}</td><td style="text-align:right">${shippingValue}</td></tr>
      ${taxRow}
      <tr><td style="padding:8px 0 0;font-weight:700">Total</td><td style="text-align:right;padding:8px 0 0;font-weight:700">${money(
        data.totalCents
      )}</td></tr>
    </table>`;
}

function deliveryBlock(data: OrderEmailData): string {
  const s = data.shipping;
  const L = (en: string, fr: string) => escapeHtml(pick(data.locale, en, fr));
  const lines = [
    escapeHtml(s.fullName),
    escapeHtml(s.line1) + (s.line2 ? `, ${escapeHtml(s.line2)}` : ""),
    `${escapeHtml(s.city)}, ${escapeHtml(s.province)} ${escapeHtml(s.postalCode)}`,
    s.country && s.country !== "CA" ? escapeHtml(s.country) : "",
    s.phone ? escapeHtml(s.phone) : data.phone ? escapeHtml(data.phone) : "",
  ].filter(Boolean);

  const meta: string[] = [
    `<strong>${L("Delivery method", "Mode de livraison")}:</strong> ${escapeHtml(
      methodLabel(data.deliveryMethod, data.locale)
    )}`,
  ];
  if (data.deliveryMethod === "PICKUP") {
    // Pickups are by appointment, not walk-in: the address is a home studio.
    meta.push(
      escapeHtml(
        L(
          "We'll message you to arrange a pickup time as soon as your basket is ready.",
          "Nous vous écrirons pour convenir d'une heure de ramassage dès que votre panier sera prêt."
        )
      )
    );
  }
  if (data.deliveryDate) {
    meta.push(
      `<strong>${L("Preferred date", "Date souhaitée")}:</strong> ${escapeHtml(
        formatStoreDate(data.deliveryDate, isFr(data.locale) ? "fr-CA" : "en-CA")
      )}`
    );
  }
  if (data.deliveryNotes) {
    meta.push(`<strong>${L("Notes", "Notes")}:</strong> ${escapeHtmlMultiline(data.deliveryNotes)}`);
  }

  const gift = data.giftMessage
    ? `<p style="margin-top:12px;padding:12px;background:#f5efe3;border-radius:12px;font-style:italic;color:#514a40">&ldquo;${escapeHtmlMultiline(
        data.giftMessage
      )}&rdquo;</p>`
    : "";

  return `<p style="margin-top:16px;color:#514a40"><strong>${L("Delivering to", "Livraison à")}</strong><br>${lines.join(
    "<br>"
  )}</p>
    <p style="margin-top:8px;color:#514a40;font-size:13px">${meta.join("<br>")}</p>
    ${gift}`;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = await orderUrl(data.orderNumber, SITE);
  const body = `
    <p style="color:#514a40">${escapeHtml(
      L(
        "Thank you for your order. We're hand-packing it now and will send tracking as soon as it ships.",
        "Merci pour votre commande. Nous la préparons à la main et vous enverrons le suivi dès l'expédition."
      )
    )}</p>
    <p style="margin:16px 0 4px"><strong>${escapeHtml(L("Order", "Commande"))} ${escapeHtml(
      data.orderNumber
    )}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(data.items, data.locale)}</table>
    ${totalsTable(data)}
    ${deliveryBlock(data)}
    ${button(link, L("View your order", "Voir votre commande"))}
    <p style="margin-top:18px;font-size:13px;line-height:1.5;color:#8a8072">${escapeHtml(
      L(
        "All sales are final. Our baskets are perishable and packed to order, so we cannot accept returns, exchanges or cancellations. If your basket arrives damaged or not as ordered, reply to this email within 48 hours of delivery with a photo and we will make it right.",
        "Toutes les ventes sont finales. Nos paniers sont périssables et préparés à la commande : nous ne pouvons accepter ni retour, ni échange, ni annulation. Si votre panier arrive endommagé ou ne correspond pas à votre commande, répondez à ce courriel dans les 48 heures suivant la livraison avec une photo et nous y remédierons."
      )
    )} <a href="${SITE}/terms" style="color:#b0894e">${escapeHtml(
      L("Terms of Service", "Conditions d'utilisation")
    )}</a></p>`;
  return send(
    data.email,
    L(`Your Velvea order ${data.orderNumber}`, `Votre commande Velvea ${data.orderNumber}`),
    shell(L("Order confirmed", "Commande confirmée"), body, data.locale)
  );
}

/**
 * Sent when an order is recorded but no payment was taken (offline mode).
 * It must never claim the order is confirmed.
 */
export async function sendOrderAwaitingPayment(data: OrderEmailData) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = await orderUrl(data.orderNumber, SITE);
  const body = `
    <p style="color:#514a40">${escapeHtml(
      L(
        "We've received your order details. Payment has not been taken yet — we'll contact you shortly to arrange it, and your basket isn't scheduled until then.",
        "Nous avons reçu les détails de votre commande. Le paiement n'a pas encore été effectué — nous vous contacterons sous peu pour l'organiser. Votre panier ne sera préparé qu'à ce moment-là."
      )
    )}</p>
    <p style="margin:16px 0 4px"><strong>${escapeHtml(L("Order", "Commande"))} ${escapeHtml(
      data.orderNumber
    )}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(data.items, data.locale)}</table>
    ${totalsTable(data)}
    ${deliveryBlock(data)}
    ${button(link, L("View your order", "Voir votre commande"))}`;
  await send(
    data.email,
    L(
      `Velvea order ${data.orderNumber} — payment to follow`,
      `Commande Velvea ${data.orderNumber} — paiement à suivre`
    ),
    shell(L("Order received", "Commande reçue"), body, data.locale)
  );
}

export async function sendAdminOrderNotice(data: OrderEmailData, opts?: { paid?: boolean }) {
  const to = adminRecipient();
  if (!to) return;
  const paid = opts?.paid ?? true;
  const heading = paid ? "New paid order" : "New order — <strong>payment not taken</strong>";
  const body = `<p>${heading} <strong>${escapeHtml(data.orderNumber)}</strong> — ${formatMoney(
    data.totalCents
  )}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(data.items, "en")}</table>
    <p style="margin-top:12px">${escapeHtml(data.shipping.fullName)} · ${escapeHtml(
      data.shipping.city
    )}, ${escapeHtml(data.shipping.province)}<br>${escapeHtml(data.email)}${
      data.phone ? ` · ${escapeHtml(data.phone)}` : ""
    }</p>
    <p style="font-size:13px;color:#514a40">${escapeHtml(methodLabel(data.deliveryMethod, "en"))}${
      data.deliveryDate ? ` · ${escapeHtml(formatStoreDate(data.deliveryDate))}` : ""
    }</p>
    <p><a href="${SITE}/admin/orders">Open in admin</a></p>`;
  await send(
    to,
    `${paid ? "New order" : "Unpaid order"} ${data.orderNumber}`,
    shell("New order", body, "en")
  );
}

export async function sendOrderShipped(data: {
  orderNumber: string;
  email: string;
  locale?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shipping: OrderEmailAddress;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = await orderUrl(data.orderNumber, SITE);
  const trackLink = data.trackingUrl
    ? `<br><a href="${escapeHtml(data.trackingUrl)}" style="color:#b0894e">${escapeHtml(
        L("Track this parcel", "Suivre ce colis")
      )}</a>`
    : "";
  const tracking = data.trackingNumber
    ? `<p style="margin-top:14px;color:#514a40"><strong>${escapeHtml(
        L("Tracking", "Suivi")
      )}</strong><br>${escapeHtml(data.carrier || "")} ${escapeHtml(data.trackingNumber)}${trackLink}</p>`
    : "";
  const body = `
    <p style="color:#514a40">${escapeHtml(
      L("Good news — your Velvea basket is on its way.", "Bonne nouvelle — votre panier Velvea est en route.")
    )}</p>
    <p style="margin:16px 0 4px"><strong>${escapeHtml(L("Order", "Commande"))} ${escapeHtml(
      data.orderNumber
    )}</strong></p>
    <p style="color:#514a40">${escapeHtml(data.shipping.fullName)}<br>${escapeHtml(
      data.shipping.line1
    )}<br>${escapeHtml(data.shipping.city)}, ${escapeHtml(data.shipping.province)} ${escapeHtml(
      data.shipping.postalCode
    )}</p>
    ${tracking}
    ${button(link, L("View your order", "Voir votre commande"))}`;
  await send(
    data.email,
    L(
      `Your Velvea order ${data.orderNumber} has shipped`,
      `Votre commande Velvea ${data.orderNumber} est expédiée`
    ),
    shell(L("On its way", "En route"), body, data.locale)
  );
}

export async function sendOrderCancelled(data: {
  orderNumber: string;
  email: string;
  locale?: string | null;
  reason?: string | null;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const reason = data.reason ? `<p style="color:#514a40">${escapeHtmlMultiline(data.reason)}</p>` : "";
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      `Your order ${data.orderNumber} has been cancelled. No payment has been taken.`,
      `Votre commande ${data.orderNumber} a été annulée. Aucun paiement n'a été prélevé.`
    )
  )}</p>
  ${reason}
  <p style="color:#514a40">${escapeHtml(
    L(
      "If this wasn't expected, just reply to this email.",
      "Si ce n'était pas prévu, répondez simplement à ce courriel."
    )
  )}</p>`;
  await send(
    data.email,
    L(`Velvea order ${data.orderNumber} cancelled`, `Commande Velvea ${data.orderNumber} annulée`),
    shell(L("Order cancelled", "Commande annulée"), body, data.locale)
  );
}

/** Sent when an order is marked delivered or picked up: closes the loop and opens the 48-hour window. */
export async function sendOrderDelivered(data: {
  orderNumber: string;
  email: string;
  locale?: string | null;
  deliveryMethod?: string | null;
  shipping: OrderEmailAddress;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = await orderUrl(data.orderNumber, SITE);
  const pickup = data.deliveryMethod === "PICKUP";
  const body = `
    <p style="color:#514a40">${escapeHtml(
      pickup
        ? L(
            "Your Velvea basket has been picked up. We hope it brings a smile.",
            "Votre panier Velvea a été récupéré. Nous espérons qu'il fera plaisir."
          )
        : L(
            "Your Velvea basket has been delivered. We hope it brings a smile.",
            "Votre panier Velvea a été livré. Nous espérons qu'il fera plaisir."
          )
    )}</p>
    <p style="margin:16px 0 4px"><strong>${escapeHtml(L("Order", "Commande"))} ${escapeHtml(
      data.orderNumber
    )}</strong></p>
    ${
      pickup
        ? ""
        : `<p style="color:#514a40">${escapeHtml(data.shipping.fullName)}<br>${escapeHtml(
            data.shipping.line1
          )}<br>${escapeHtml(data.shipping.city)}, ${escapeHtml(data.shipping.province)} ${escapeHtml(
            data.shipping.postalCode
          )}</p>`
    }
    <p style="margin-top:14px;color:#514a40">${escapeHtml(
      L(
        "If anything about your basket isn't right, reply to this email within 48 hours with a photo and we will make it right.",
        "Si quelque chose ne va pas avec votre panier, répondez à ce courriel dans les 48 heures avec une photo et nous y remédierons."
      )
    )}</p>
    ${button(link, L("View your order", "Voir votre commande"))}`;
  await send(
    data.email,
    pickup
      ? L(
          `Your Velvea order ${data.orderNumber} has been picked up`,
          `Votre commande Velvea ${data.orderNumber} a été récupérée`
        )
      : L(
          `Your Velvea order ${data.orderNumber} has been delivered`,
          `Votre commande Velvea ${data.orderNumber} a été livrée`
        ),
    shell(L(pickup ? "Picked up" : "Delivered", pickup ? "Récupérée" : "Livrée"), body, data.locale)
  );
}

export async function sendOrderRefunded(data: {
  orderNumber: string;
  email: string;
  locale?: string | null;
  amountCents: number;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const money = formatMoney(data.amountCents, isFr(data.locale) ? "fr-CA" : "en-CA");
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      `We've refunded ${money} for order ${data.orderNumber}. It usually reaches your statement within 5–10 business days.`,
      `Nous avons remboursé ${money} pour la commande ${data.orderNumber}. Le montant apparaît généralement sous 5 à 10 jours ouvrables.`
    )
  )}</p>`;
  await send(
    data.email,
    L(
      `Refund for Velvea order ${data.orderNumber}`,
      `Remboursement — commande Velvea ${data.orderNumber}`
    ),
    shell(L("Refund issued", "Remboursement émis"), body, data.locale)
  );
}

// ---------------------------------------------------------------------------
// Corporate inquiries
// ---------------------------------------------------------------------------

export async function sendCorporateInquiryNotice(inq: {
  company: string;
  contactName: string;
  email: string;
  phone?: string | null;
  budget?: string | null;
  quantity?: string | null;
  occasion?: string | null;
  message?: string | null;
}) {
  const to = adminRecipient();
  if (!to) return;
  const line = (label: string, value?: string | null) =>
    value
      ? `<p style="margin:2px 0;font-size:13px"><span style="color:#8a8072">${label}:</span> ${escapeHtml(
          value
        )}</p>`
      : "";
  const message = inq.message
    ? `<p style="color:#514a40;margin-top:10px">${escapeHtmlMultiline(inq.message)}</p>`
    : "";
  const body = `<p>New corporate inquiry from <strong>${escapeHtml(inq.company)}</strong></p>
    <p>${escapeHtml(inq.contactName)} · <a href="mailto:${escapeHtml(inq.email)}">${escapeHtml(
      inq.email
    )}</a></p>
    ${line("Phone", inq.phone)}
    ${line("Budget", inq.budget)}
    ${line("Quantity", inq.quantity)}
    ${line("Occasion", inq.occasion)}
    ${message}
    <p><a href="${SITE}/admin/inquiries">Open in admin</a></p>`;
  await send(to, `Corporate inquiry — ${inq.company}`, shell("Corporate inquiry", body, "en"));
}

/** Acknowledgement to the person who submitted the corporate form. */
export async function sendCorporateInquiryAck(inq: {
  contactName: string;
  email: string;
  company: string;
  locale?: string | null;
}) {
  const L = (en: string, fr: string) => pick(inq.locale, en, fr);
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      `Thank you, ${inq.contactName}. We've received your corporate gifting enquiry for ${inq.company} and will reply within one business day with options and pricing.`,
      `Merci, ${inq.contactName}. Nous avons bien reçu votre demande de cadeaux d'entreprise pour ${inq.company} et vous répondrons d'ici un jour ouvrable avec des options et des prix.`
    )
  )}</p>
  <p style="color:#514a40">${escapeHtml(
    L("In the meantime, our corporate guide is here:", "Entre-temps, notre guide entreprise est ici :")
  )} <a href="${SITE}/corporate" style="color:#b0894e">${SITE}/corporate</a></p>`;
  await send(
    inq.email,
    L("We received your Velvea enquiry", "Nous avons reçu votre demande Velvea"),
    shell(L("Thank you", "Merci"), body, inq.locale)
  );
}

// ---------------------------------------------------------------------------
// Account & marketing
// ---------------------------------------------------------------------------

export async function sendPasswordReset(data: {
  email: string;
  token: string;
  locale?: string | null;
  admin?: boolean;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const path = data.admin ? "/admin/reset" : "/account/reset";
  const link = `${SITE}${path}?token=${encodeURIComponent(data.token)}`;
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      "Someone asked to reset the password for this email. The link below works once and expires in one hour.",
      "Une réinitialisation de mot de passe a été demandée pour cette adresse. Le lien ci-dessous est à usage unique et expire dans une heure."
    )
  )}</p>
  ${button(link, L("Choose a new password", "Choisir un nouveau mot de passe"))}
  <p style="color:#8a8072;font-size:12px;margin-top:14px">${escapeHtml(
    L(
      "If you didn't request this, you can safely ignore this email.",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez ce courriel."
    )
  )}</p>`;
  await send(
    data.email,
    L("Reset your Velvea password", "Réinitialiser votre mot de passe Velvea"),
    shell(L("Password reset", "Réinitialisation"), body, data.locale)
  );
}

export async function sendEmailVerification(data: {
  email: string;
  token: string;
  locale?: string | null;
}): Promise<boolean> {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = `${SITE}/account/verify?token=${encodeURIComponent(data.token)}`;
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      "Confirm your email address so we can link your past orders to your account.",
      "Confirmez votre adresse courriel pour que nous puissions relier vos commandes à votre compte."
    )
  )}</p>
  ${button(link, L("Confirm my email", "Confirmer mon courriel"))}`;
  return send(
    data.email,
    L("Confirm your Velvea email", "Confirmez votre courriel Velvea"),
    shell(L("Confirm your email", "Confirmez votre courriel"), body, data.locale)
  );
}

/** CASL double opt-in: nothing is mailed to a subscriber until they confirm. */
export async function sendNewsletterConfirm(data: {
  email: string;
  token: string;
  locale?: string | null;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const link = `${SITE}/api/newsletter/confirm?token=${encodeURIComponent(data.token)}`;
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      "Please confirm you'd like occasional notes from Velvea — new collections, seasonal guides and early access. We'll only email you once you've confirmed.",
      "Confirmez que vous souhaitez recevoir occasionnellement des nouvelles de Velvea — nouvelles collections, guides saisonniers et accès anticipé. Nous n'écrirons qu'après votre confirmation."
    )
  )}</p>
  ${button(link, L("Confirm subscription", "Confirmer l'abonnement"))}`;
  await send(
    data.email,
    L("Confirm your Velvea subscription", "Confirmez votre abonnement Velvea"),
    shell(L("One more step", "Une dernière étape"), body, data.locale)
  );
}

export async function sendNewsletterWelcome(data: {
  email: string;
  token: string;
  locale?: string | null;
}) {
  const L = (en: string, fr: string) => pick(data.locale, en, fr);
  const unsubscribe = `${SITE}/api/newsletter/unsubscribe?token=${encodeURIComponent(data.token)}`;
  const body = `<p style="color:#514a40">${escapeHtml(
    L(
      "You're on the list. Expect a note when a new collection lands or a season calls for something considered.",
      "Vous êtes inscrit. Vous recevrez un mot dès qu'une nouvelle collection arrive ou qu'une saison appelle une attention particulière."
    )
  )}</p>
  ${button(`${SITE}/baskets`, L("Browse the collection", "Découvrir la collection"))}`;
  const footer = ` · <a href="${unsubscribe}" style="color:#8a8072">${escapeHtml(
    L("Unsubscribe", "Se désabonner")
  )}</a>`;
  await send(
    data.email,
    L("Welcome to Velvea", "Bienvenue chez Velvea"),
    shell(L("Welcome", "Bienvenue"), body, data.locale, footer),
    // RFC 8058 one-click unsubscribe; the route accepts GET and POST.
    {
      "List-Unsubscribe": `<${unsubscribe}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    }
  );
}
