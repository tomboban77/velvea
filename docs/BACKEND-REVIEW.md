# Velvea backend review — 12 Sept 2026

Scope: payments, orders, auth, admin operations, emails, data model, i18n. Findings verified in source.
Status legend: **Fix before launch** · **Fix soon after launch** · **Improve** · **Nice to have**.

## Status — verified against source 24 Sept 2026

**Numbered findings 1–25: all resolved** except as noted. Verified item by item in code (`npm test`
147 passing, `tsc` clean).

- **#4 gift cards — mitigated, not built.** Paused behind `GIFT_CARDS_ENABLED = false`
  (`src/lib/features.ts`); hidden from listings, search, sitemap, checkout, nav and admin. Issuance,
  emailing and redemption still do not exist. Owner decision 24 Sept: stay paused through launch.
  Re-enable only after implementing both.
- **#20 — closed 24 Sept, differently than proposed.** Order create and the `stripeSessionId`
  write cannot be one transaction: the Stripe call sits between them. The real defect was that a
  failed `stripeSessionId` write fell into the catch that cancels the order and releases the
  discount — while a payable Checkout session was already live, so a customer could still pay a
  cancelled order. That write is now non-fatal and logged. Nothing else reads the column except
  abandoned-session expiry.

**Improve list:** done — account profile/password/addresses + checkout prefill, seasonal collections
seeded, review verification/dedupe, discounts edit, customers list, staff/role screen, DB-level admin
product search, `publishedAt` preserved, indexes, `Order.locale/shippedAt/deliveredAt`. Done 21 Sept:
builder item image/active/reorder + category rename with real FR name; collections reorder + SEO
title/description fields in admin; `fr-CA` money formatting in cart drawer and checkout.

**Done 24 Sept 2026**
- Per-collection product ordering: `listCollectionProducts` / `reorderCollectionProducts` actions,
  an expandable "Product order" panel in the collections admin, and `getProductsByCollection` now
  reads through the join row so `ProductCollection.position` drives the default listing order. An
  explicit `?sort=` still wins.
- `ContainerCard` sends its stored `position`, so saving a container no longer resets the order.
- Checkout copy moved off 42 inline `fr ?` ternaries onto a `checkoutForm` namespace in
  `messages/*.json`. Only the two `fr ? "fr-CA" : "en-CA"` money-format selectors remain, which are
  locale choices rather than copy. `tests/messages.test.ts` guards EN/FR key parity, empty FR
  strings, ICU placeholder agreement, and that every `tc("…")` call site resolves — a missing key
  throws in next-intl, so this is a crash guard on the one page that takes money.
- `Order.billing` dropped (owner decision: Stripe already holds the billing address on the payment
  intent). Migration `20260924000000_drop_order_billing` is **written but not applied** — run
  `npx prisma migrate deploy` against production when ready.

**Still open**
- Gift card issuance and redemption (#4), deferred by decision.
- Redirects for renamed/removed product slugs need slug-history storage. Deferred 24 Sept: nothing
  is indexed yet, so there is no link equity to lose. Revisit once products rank.

## Fix before launch (security / money)

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | Webhook trusts unsigned events when `STRIPE_WEBHOOK_SECRET` is blank: anyone can POST a fake `checkout.session.completed` and mark an order PAID | `src/app/api/stripe/webhook/route.ts:18-22` | Return 503 when secret missing; never `JSON.parse` an unsigned body |
| 2 | Hard-coded fallback JWT secret `dev-insecure-secret-change-me`; if `AUTH_SECRET` is unset in prod anyone can mint an ADMIN token | `src/lib/auth.ts:14`, `src/middleware.ts:14` | Throw at startup if secret missing/short; fail closed in middleware |
| 3 | Any Stripe error silently falls through to the "offline" path: customer is emailed "order confirmed", admin is told to pack it, nobody paid | `src/lib/actions/checkout.ts:300-309` | If Stripe is configured, return an error; reserve offline mode for an explicit env flag and send a "we'll contact you for payment" email instead |
| 4 | Gift cards are sold but never created, emailed or redeemable; `GiftCard` model is never written; no redemption field at checkout; tax is charged on them | `GiftCardPicker.tsx`, `checkout.ts`, `orders.ts` | On payment, create `GiftCard` rows per unit and email the code; add redemption input debiting `balanceCents` atomically; exempt from tax and free-shipping threshold; hide `velvea-gift-card` from listings/search |
| 5 | Order confirmation page exposes full name, address, gift message to anyone with the order number (predictable timestamp prefix, no rate limit) | `src/app/[locale]/order/[orderNumber]/page.tsx:27-34` | Gate on Stripe `session_id` ownership, logged-in owner, or signed token in the email link |
| 6 | Registered user sees all orders matching their *unverified* email, so registering with a guest's email exposes their orders | `src/app/[locale]/account/page.tsx:22` | Match on `userId` only, or on email only when `emailVerified` is set |
| 7 | Seed falls back to fixed admin credentials `admin@velvea.ca / Velvea!2026` and prints them | `prisma/seed.ts:13-14,25` | Require env vars, exit otherwise, never log the password |
| 8 | Custom basket: same add-on picked 3× is charged 1× (`findMany in` de-duplicates); no check of `active`, capacity, or container existence; `customConfig` is `z.any()` | `src/lib/actions/checkout.ts:72-84` | Count occurrences per id; zod-validate config; enforce active + capacity; store `{itemId, qty, price}` snapshot on the order item |
| 9 | Saving a product deletes and recreates all variants, so any cart holding an old `variantId` silently falls back to base price (a $200 gift card becomes $50) | `src/lib/actions/products.ts:142-145` | Upsert variants by id; reject checkout lines whose `variantId` no longer exists |
| 10 | `markOrderPaid` is check-then-act; webhook and success page race → duplicate emails and double discount increments | `src/lib/actions/orders.ts:8-29` | `updateMany({where:{id,status:"PENDING"}})` and act only if `count===1`, inside one transaction |
| 11 | No rate limiting anywhere: admin login, customer login/register, discount validation, reviews, newsletter, corporate form, checkout | all auth actions and `/api/*` | Upstash Ratelimit or Vercel WAF rules per IP/email; honeypot + Turnstile on the three public forms |
| 12 | HTML injection in emails (names, address, gift message, inquiry text interpolated raw) | `src/lib/email.ts:59-60,77-78,101-103` | Escape every interpolated value |
| 13 | Discount usage limit not reserved (N concurrent shoppers can all use the last redemption); `perCustomerLimit`, `startsAt`, `endsAt` not enforced/editable | `src/lib/pricing.ts:45`, `orders.ts:25-29` | Conditional `updateMany` on increment; enforce per-customer by counting paid orders |

## Fix soon after launch (correctness / operations)

| # | Issue | Where | Fix |
|---|---|---|---|
| 14 | Displayed total can differ from charged total: delivery method silently downgraded, inactive items silently dropped, client preview uses hard-coded `CLIENT_SETTINGS` while server uses admin-edited settings | `checkout.ts:109,153-158`, `settings-client.ts` | Return a structured "cart changed" error; pass server settings into the checkout page |
| 15 | Inventory fields exist but are never checked, decremented or shown as sold out | `checkout.ts`, `orders.ts`, PDP | Enforce at checkout and decrement on payment, or remove the fields |
| 16 | Webhook handles only `checkout.session.completed`; no `expired`, `refunded`, dispute or async-payment events; paid amount never compared to order total | `webhook/route.ts:29` | Handle expiry → CANCELLED, refund → REFUNDED; assert `amount_total === totalCents` |
| 17 | Order fulfilment gaps: no tracking number / carrier / shippedAt, no shipped or cancelled email, no note UI, no order search/pagination/CSV, no packing slip, no refund action | `admin.ts:29-46`, `OrderStatusControl.tsx`, `orders/page.tsx` | Add tracking fields + shipped email, note input, search/pagination, export |
| 18 | Delivery date not validated (past dates, lead time, same-day cutoff only enforced client-side); `YYYY-MM-DD` parsed as UTC shows previous day in Toronto | `checkout.ts:198`, `utils.ts:28-34` | Validate and parse in `America/Toronto`; enforce cutoff server-side |
| 19 | Emails: English only, no `Order.locale`, omit variant, phone, line 2, delivery method/date, custom-basket contents; no shipped, inquiry-acknowledgement, newsletter or password-reset emails; no reply-to | `src/lib/email.ts` | Add `Order.locale`, bilingual templates, full order detail, missing events |
| 20 | Stripe coupon created per checkout and never deleted; no idempotency key on session creation; order + session not transactional | `checkout.ts:274-292` | `idempotencyKey: order.id`, delete coupon after session, single update |
| 21 | Admin JWT lives 30 days with role baked in; no revocation; `STAFF` role has full admin power; admin login message reveals admin accounts | `auth.ts:10,33-39`, `actions/auth.ts:33-37` | 8–12 h sliding admin sessions, re-check role in `guard()`, uniform login error, STAFF permissions |
| 22 | No security headers (CSP, HSTS, frame-ancestors, nosniff, referrer policy) | `next.config.ts` | Add `headers()` |
| 23 | Admin mutation actions in `admin.ts` accept unvalidated input (only `products.ts` uses zod) | `src/lib/actions/admin.ts` | Zod-parse every action input |
| 24 | Article body is raw HTML rendered with `dangerouslySetInnerHTML`; any STAFF user can publish script | `guides/[slug]/page.tsx:41` | Sanitise on save or switch to Markdown |
| 25 | No password reset (customers or admins), no email verification, no newsletter double opt-in / unsubscribe (CASL) | `actions/auth.ts`, `api/newsletter` | Add token-based reset, verification, confirm + unsubscribe links |

## Improve (product completeness)

- Customer account is an order list only. `Address` model unused; no profile, password change, saved addresses or checkout prefill, although the register screen promises "Save your addresses".
- Seasonal nav (Christmas, Valentine's, Mother's/Father's Day, Thanksgiving) links to collections that are never seeded → empty pages. Seed them or drop from nav/sitemap.
- Reviews: `verified` is always false; seeded `avgRating/reviewCount` are random and collapse on first moderation; no dedupe per product.
- Discounts admin: create/delete only, no edit, duplicate code silently overwrites.
- Builder admin: items can't be deactivated, have no image upload, no reorder; categories can't be renamed or given a French name.
- Collections admin: no reorder, no SEO fields, slug/type frozen, no per-collection product ordering.
- No customers list, no staff/role management screen.
- Admin product search is in-memory over the first 100 rows, English names only.
- `publishedAt` on articles resets on every save.
- Checkout, cart drawer, shipping/privacy/terms pages and all emails are hard-coded English; many components use inline `fr ?` ternaries instead of the message catalogue. Money formatting ignores `fr-CA`.
- Missing indexes: `Order.userId`, `Review(status, createdAt)`, `OrderItem.productId`, `Product(status, createdAt/priceCents/avgRating)`.
- `Order.billing` never populated; no `shippedAt/deliveredAt`; `expressShippingCents` editable but unused; `Order.locale` missing.

## What is solid

- Prices, variants and discounts are recomputed server-side from the database; client prices are preview only. All money is integer cents.
- Tax is by destination province and applied to discounted subtotal plus shipping, which is correct for Canada.
- Order items are snapshots with no FK to products, so catalogue edits never corrupt order history.
- Admin is guarded in three layers (middleware, layout, every server action) and the upload route re-checks the session.
- Passwords hashed with bcrypt cost 11; cookies are httpOnly, sameSite=lax, secure in production; no open redirect; Prisma parameterises all queries; user content is rendered through React escaping.
- Stripe signature verification is used when configured; amounts are itemised in CAD; a success-page settle path covers a missed webhook.
- The app runs end to end with no Stripe/Cloudinary/Resend keys and with an empty or unreachable database.
- Migration matches the schema; EN and FR message catalogues are in sync (269 keys each).
