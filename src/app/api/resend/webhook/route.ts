import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminRecipient, sendOwnerAlert } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Delivery reports from Resend.
 *
 * `send()` only knows whether Resend *accepted* a message. What happens next
 * (a mistyped address bouncing, a full mailbox, a recipient marking it as spam)
 * arrives here, minutes later. Before this route existed a bounced order
 * confirmation left no trace anywhere: the customer had paid, had no receipt,
 * and the first anyone heard of it was their complaint.
 *
 * Each failure is forwarded to the owner inbox with the recipient and subject
 * (order emails carry the order number in the subject). Nothing is written to
 * the database.
 *
 * Setup: Resend dashboard > Webhooks > add https://www.velvea.ca/api/resend/webhook
 * for email.bounced, email.complained, email.delivery_delayed, email.failed and
 * email.suppressed, then put the signing secret in RESEND_WEBHOOK_SECRET.
 */

/** Resend signs with Svix; anything older than this is treated as a replay. */
const TOLERANCE_SECONDS = 5 * 60;

function verifySignature(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();

  // The header is a space-separated list of "v1,<base64>" entries (several
  // while a secret is being rotated); any one matching is enough.
  return signatures.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

type ResendEvent = {
  type?: string;
  data?: {
    to?: string[] | string;
    subject?: string;
    bounce?: { message?: string; type?: string; subType?: string };
    failed?: { reason?: string };
  };
};

/** What happened and what the owner should do about it, per event type. */
const PROBLEMS: Record<string, { short: string; what: string; advice: string }> = {
  "email.bounced": {
    short: "bounced",
    what: "bounced",
    advice:
      "The address is probably mistyped or the mailbox no longer exists. Reach the customer another way (the order has their phone number) and send the details yourself.",
  },
  "email.failed": {
    short: "could not be sent",
    what: "could not be sent",
    advice: "Reach the customer another way and send the details yourself.",
  },
  "email.suppressed": {
    short: "was blocked",
    what: "was not sent, because an earlier email to this address bounced or was marked as spam",
    advice:
      "Reach the customer another way. To email this address again, remove it from the suppression list in the Resend dashboard.",
  },
  "email.delivery_delayed": {
    short: "is delayed",
    what: "is delayed",
    advice:
      "The receiving mail server has not accepted it yet. Resend keeps trying; if the customer asks, send the details yourself.",
  },
  "email.complained": {
    short: "was marked as spam",
    what: "was marked as spam by the recipient",
    advice:
      "Resend will not email this address again. Spam reports hurt delivery for every other customer, so if this happens more than once, check what was sent.",
  },
};

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Unsigned reports would let anyone fill the owner inbox with fake alerts.
    console.error("[resend] RESEND_WEBHOOK_SECRET is not set, refusing webhooks.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  if (!verifySignature(body, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const problem = event.type ? PROBLEMS[event.type] : undefined;
  if (!problem) return NextResponse.json({ received: true });

  const recipients = ([] as string[]).concat(event.data?.to ?? []).map((a) => a.trim().toLowerCase());
  const subject = event.data?.subject ?? "(no subject)";

  // An alert about mail to the owner inbox would itself go to the owner inbox:
  // if that inbox is the one bouncing, each alert would raise another.
  const owner = adminRecipient().toLowerCase();
  if (!recipients.length || recipients.every((a) => a === owner)) {
    console.error(`[resend] ${event.type} for owner mail "${subject}", not alerting.`);
    return NextResponse.json({ received: true });
  }

  const reason = event.data?.bounce?.message || event.data?.failed?.reason || "";
  console.error(`[resend] ${event.type} to=${recipients.join(",")} subject="${subject}" ${reason}`);
  await sendOwnerAlert(
    `Email to ${recipients.join(", ")} ${problem.short}`,
    `The email "${subject}" to ${recipients.join(", ")} ${problem.what}.${
      reason ? `\nReason given: ${reason}` : ""
    }\n\n${problem.advice}`
  );
  return NextResponse.json({ received: true });
}
