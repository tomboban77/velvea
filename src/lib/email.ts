import "server-only";
import { Resend } from "resend";
import { formatMoney } from "./utils";

const FROM = process.env.EMAIL_FROM || "Velvea <hello@velvea.ca>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function send(to: string, subject: string, html: string) {
  const resend = client();
  if (!resend) {
    console.log(`\n[email not sent - RESEND_API_KEY missing]\n  to: ${to}\n  subject: ${subject}\n`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fbf8f2;font-family:Helvetica,Arial,sans-serif;color:#211b15">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="text-align:center;padding:8px 0 20px">
      <span style="font-size:22px;letter-spacing:4px;font-weight:700;background:linear-gradient(90deg,#c9a86c,#b0894e);-webkit-background-clip:text;background-clip:text;color:#b0894e">VELVÉA</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e8dfcf;border-radius:20px;padding:28px">
      <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#8a8072;font-size:12px;margin-top:20px">
      Velvea · Mississauga, Ontario · <a href="${SITE}" style="color:#b0894e">velvea.ca</a>
    </p>
  </div></body></html>`;
}

type OrderEmailData = {
  orderNumber: string;
  email: string;
  items: { name: string; quantity: number; unitPriceCents: number }[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  shipping: { fullName: string; line1: string; city: string; province: string; postalCode: string };
  giftMessage?: string | null;
};

function itemRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e7d6">${i.name} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e7d6;text-align:right">${formatMoney(i.unitPriceCents * i.quantity)}</td></tr>`
    )
    .join("");
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const body = `
    <p style="color:#514a40">Thank you for your order. We're hand-packing it now and will send tracking as soon as it ships.</p>
    <p style="margin:16px 0 4px"><strong>Order ${data.orderNumber}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(data.items)}</table>
    <table style="width:100%;font-size:14px;margin-top:12px">
      <tr><td style="color:#8a8072;padding:2px 0">Subtotal</td><td style="text-align:right">${formatMoney(data.subtotalCents)}</td></tr>
      ${data.discountCents ? `<tr><td style="color:#8a8072;padding:2px 0">Discount</td><td style="text-align:right;color:#3f7d5b">−${formatMoney(data.discountCents)}</td></tr>` : ""}
      <tr><td style="color:#8a8072;padding:2px 0">Shipping</td><td style="text-align:right">${data.shippingCents ? formatMoney(data.shippingCents) : "Free"}</td></tr>
      <tr><td style="color:#8a8072;padding:2px 0">Tax</td><td style="text-align:right">${formatMoney(data.taxCents)}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700">Total</td><td style="text-align:right;padding:8px 0 0;font-weight:700">${formatMoney(data.totalCents)}</td></tr>
    </table>
    <p style="margin-top:16px;color:#514a40"><strong>Delivering to</strong><br>${data.shipping.fullName}<br>${data.shipping.line1}<br>${data.shipping.city}, ${data.shipping.province} ${data.shipping.postalCode}</p>
    ${data.giftMessage ? `<p style="margin-top:12px;padding:12px;background:#f5efe3;border-radius:12px;font-style:italic;color:#514a40">"${data.giftMessage}"</p>` : ""}
    <p style="margin-top:20px"><a href="${SITE}/order/${data.orderNumber}" style="display:inline-block;background:#211b15;color:#f7f2e8;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">View your order</a></p>`;
  await send(data.email, `Your Velvea order ${data.orderNumber}`, shell("Order confirmed", body));
}

export async function sendAdminOrderNotice(data: OrderEmailData) {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_FROM || "";
  if (!to) return;
  const body = `<p>New order <strong>${data.orderNumber}</strong> — ${formatMoney(data.totalCents)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(data.items)}</table>
    <p style="margin-top:12px">${data.shipping.fullName} · ${data.shipping.city}, ${data.shipping.province}</p>
    <p><a href="${SITE}/admin/orders">Open in admin</a></p>`;
  await send(to.replace(/.*<|>.*/g, ""), `New order ${data.orderNumber}`, shell("New order", body));
}

export async function sendCorporateInquiryNotice(inq: {
  company: string;
  contactName: string;
  email: string;
  message?: string | null;
}) {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_FROM || "";
  if (!to) return;
  const body = `<p>New corporate inquiry from <strong>${inq.company}</strong></p>
    <p>${inq.contactName} · ${inq.email}</p>
    ${inq.message ? `<p style="color:#514a40">${inq.message}</p>` : ""}
    <p><a href="${SITE}/admin/inquiries">Open in admin</a></p>`;
  await send(to.replace(/.*<|>.*/g, ""), `Corporate inquiry — ${inq.company}`, shell("Corporate inquiry", body));
}
