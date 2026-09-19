/**
 * Stripe configuration checker.
 *
 *   npm run check:stripe
 *
 * Reads the environment it is run against and asks Stripe itself whether the
 * setup will actually work. Run it locally against test keys, and against the
 * production environment (`vercel env pull` first) before taking real money.
 *
 * It prints no secrets — only key prefixes and modes — so the output is safe
 * to share.
 */
import Stripe from "stripe";

/** Every event type the webhook route handles. Keep in sync with route.ts. */
const REQUIRED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created",
  "payment_intent.payment_failed",
];

const problems: string[] = [];
const warnings: string[] = [];
const ok: string[] = [];

const mode = (key?: string) =>
  !key ? "missing" : key.includes("_live_") ? "live" : key.includes("_test_") ? "test" : "unknown";

/**
 * The account this API key belongs to.
 *
 * `GET /v1/account` returns it without needing an id, but the SDK's typings
 * insist on one, so the call is made directly. Not `accounts.list()` — that
 * returns *connected* accounts, which for a non-Connect business is empty.
 */
async function currentAccount(stripe: Stripe): Promise<Stripe.Account> {
  // Called with no id it hits GET /v1/account, which is what we want. The
  // typings only describe the by-id form, hence the cast. Not accounts.list()
  // — that returns *connected* accounts, which for a non-Connect business is
  // an empty array.
  // Bound, because pulling the method off the resource loses `this` and the
  // SDK then fails on an undefined internal request helper.
  const retrieveSelf = stripe.accounts.retrieve.bind(
    stripe.accounts
  ) as unknown as () => Promise<Stripe.Account>;
  return retrieveSelf();
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  const secretMode = mode(secret);
  const pubMode = mode(publishable);

  console.log(`secret key       ${secretMode}`);
  console.log(`publishable key  ${pubMode}`);
  console.log(`webhook secret   ${webhookSecret ? "set" : "MISSING"}`);
  console.log(`site url         ${site || "(unset)"}`);
  console.log("");

  if (!secret) {
    problems.push("STRIPE_SECRET_KEY is not set — checkout will refuse to take payments.");
    report();
    return;
  }

  // A test publishable key with a live secret key is the classic go-live bug:
  // the browser and the server disagree about which account they are talking to.
  if (secretMode !== pubMode) {
    problems.push(
      `Key modes disagree: secret is ${secretMode}, publishable is ${pubMode}. Both must be the same.`
    );
  } else {
    ok.push(`Both keys are ${secretMode} mode.`);
  }

  if (!webhookSecret) {
    problems.push("STRIPE_WEBHOOK_SECRET is not set — the app refuses unsigned webhooks, so no order will ever be marked paid.");
  }

  if (process.env.ALLOW_OFFLINE_ORDERS === "true") {
    problems.push("ALLOW_OFFLINE_ORDERS is enabled while Stripe is configured — startup will refuse to boot.");
  }

  if (secretMode === "live") {
    if (!site.startsWith("https://")) {
      problems.push(`NEXT_PUBLIC_SITE_URL is "${site}" — live mode needs a public https URL for redirects and webhooks.`);
    }
    if (site.includes("localhost")) {
      problems.push("NEXT_PUBLIC_SITE_URL points at localhost while using live keys.");
    }
  }

  const stripe = new Stripe(secret, { typescript: true });

  // --- Does the key work, and whose account is it? ---
  try {
    const account = await currentAccount(stripe);
    ok.push(`Key is valid. Account: ${account.business_profile?.name ?? account.id} (${account.country})`);
    if (!account.charges_enabled) {
      problems.push("charges_enabled is false — the account cannot take payments yet. Finish activation.");
    } else {
      ok.push("charges_enabled: the account can take payments.");
    }
    if (!account.payouts_enabled) {
      warnings.push("payouts_enabled is false — money will be collected but not paid out yet. Usually a missing bank account or pending verification.");
    } else {
      ok.push("payouts_enabled: money will reach your bank.");
    }
    const descriptor = account.settings?.payments?.statement_descriptor;
    if (!descriptor) {
      warnings.push("No statement descriptor set — customers may not recognise the charge.");
    } else if (/growmint/i.test(descriptor)) {
      warnings.push(`Statement descriptor is "${descriptor}". Customers buy from Velvea and will not recognise it.`);
    } else {
      ok.push(`Statement descriptor: "${descriptor}"`);
    }
  } catch (err) {
    problems.push(`Stripe rejected the secret key: ${(err as Error).message}`);
    report();
    return;
  }

  // --- Is the webhook registered, at the right URL, for the right events? ---
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    if (endpoints.data.length === 0) {
      problems.push("No webhook endpoints registered. Orders will never be marked paid.");
    }
    const expected = site ? `${site}/api/stripe/webhook` : "/api/stripe/webhook";
    const match = endpoints.data.find((e) => e.url === expected);

    const isLocal = site.includes("localhost") || site.startsWith("http://");

    if (!match && isLocal) {
      // Local development forwards events with `stripe listen`, so there is no
      // registered endpoint to find. Not a failure.
      warnings.push(
        `No registered endpoint for ${expected} — expected locally. Use: stripe listen --forward-to ${expected}`
      );
    } else if (!match) {
      problems.push(`No webhook endpoint matches ${expected}. Found: ${endpoints.data.map((e) => e.url).join(", ") || "none"}`);
    } else {
      ok.push(`Webhook endpoint registered: ${match.url} (${match.status})`);
      if (match.status !== "enabled") {
        problems.push(`Webhook endpoint is "${match.status}", not enabled.`);
      }
      const subscribed = match.enabled_events;
      const listensToAll = subscribed.includes("*");
      const missing = listensToAll ? [] : REQUIRED_EVENTS.filter((e) => !subscribed.includes(e));
      if (missing.length) {
        problems.push(`Webhook is missing ${missing.length} required event(s): ${missing.join(", ")}`);
      } else {
        ok.push(`All ${REQUIRED_EVENTS.length} required events are subscribed.`);
      }
    }
  } catch (err) {
    warnings.push(`Could not list webhook endpoints: ${(err as Error).message}`);
  }

  report();
}

function report() {
  for (const o of ok) console.log(`  ok    ${o}`);
  for (const w of warnings) console.log(`  warn  ${w}`);
  for (const p of problems) console.log(`  FAIL  ${p}`);
  console.log("");
  if (problems.length) {
    console.log(`${problems.length} problem(s) would stop real payments working.`);
    process.exitCode = 1;
  } else {
    console.log(warnings.length ? "No blocking problems; see warnings above." : "Stripe configuration looks complete.");
  }
}

main();
