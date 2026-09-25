# Velvea — notes for Claude Code

Bilingual (EN/FR) gift-basket storefront + admin for a Mississauga, Ontario business.
Next.js 15 App Router · TypeScript · Tailwind v4 · Prisma on Neon Postgres · Stripe Checkout ·
Resend (email) · Cloudinary (images) · Upstash Redis (rate limiting, REST) · Cloudflare Turnstile
(public forms) · Vercel Analytics + Speed Insights. Deployed on Vercel at https://www.velvea.ca.

## Safety — read first

- **The local `.env` `DATABASE_URL` points at the PRODUCTION Neon database** (same host as
  `.env.vercel.production`). Never run `db:reset`, `db:push`, `db:seed`, `prisma migrate reset`,
  `import:products`, or ad-hoc scripts that write, without an explicit go-ahead. Do not edit
  `prisma/schema.prisma` or run prisma commands unless asked.
- `.env.vercel.production` is a pulled snapshot of the prod env (gitignored). **Stripe is live**
  there (`sk_live_`). Local `.env` uses test keys. `npm run check:stripe` prints only key prefixes.
- Tests must never touch the DB or Stripe: mock `@/lib/prisma` and `@/lib/stripe`
  (`tests/helpers/setup.ts` also points `DATABASE_URL` at an unroutable address as a backstop).
- **No alcohol products**: the business holds no AGCO licence. Run `npm run audit:alcohol` after
  any catalogue change (`scripts/audit-alcohol.ts`; `-- --fix` takes flagged items off sale).
- Gift cards are built but **paused** behind `GIFT_CARDS_ENABLED = false` in `src/lib/features.ts`
  (no issuance/redemption exists yet). Don't re-enable without implementing both.
- The **custom basket builder is paused** behind `CUSTOM_BUILDER_ENABLED = false` (same file): every
  container and add-on in the database is still seeded demo data with no images and English-only
  French names. The flag hides the nav entries, the home section, the hero CTA, the sitemap entry
  and `llms.txt`, 404s `/custom`, and makes checkout refuse a custom line from a stale cart.
  Re-enabling is a content job (real items + photography in `/admin/builder`), then flip the flag.
- **Search indexing is switched off by default.** `SITE_INDEXING` (unset/`off` · `home` · `all`) in
  `src/lib/seo.ts` drives noindex on every storefront page, the `X-Robots-Tag` header in
  `src/middleware.ts` and the sitemap contents. Production launches by setting `SITE_INDEXING=all`
  in Vercel; nothing in code should hard-code indexability.
- The owner runs the dev server and does visual checks themselves: after a UI change, run `tsc`
  and lint, then hand over. Don't start `npm run dev` or screenshot loops unprompted.

## Outstanding work lists

`docs/LAUNCH-CHECKLIST.md` is the running order: everything between the current build and a live,
indexed storefront, owner decisions included. It summarises the two detailed records —
`docs/BACKEND-REVIEW.md` (security/money, correctness, product-completeness findings, with status)
and `docs/SEO-BRIEF.md` (launch-critical SEO spec + implementation tickets). Check these before
proposing new work; update them when an item is done.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Next dev server (owner usually runs this) |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint (next/core-web-vitals + next/typescript) |
| `npm test` / `npm run test:watch` | Vitest, `tests/**/*.test.ts`, node env, all I/O mocked |
| `npx tsc --noEmit -p tsconfig.json` | Type check (tsconfig includes `tests/`) |
| `npm run db:migrate` | `prisma migrate dev` — **dev DBs only** |
| `npx prisma migrate deploy` | Apply migrations to production (Vercel build does not) |
| `npm run check:stripe` | Verifies Stripe keys/webhook events (`scripts/check-stripe.ts`) |

## Layout

```
src/app/[locale]/       storefront; EN at "/", FR at "/fr" (next-intl, localePrefix "as-needed")
src/app/admin/          login/forgot/reset + (panel)/ route group: orders, products, discounts,
                        delivery-zones, settings, staff, reviews, inquiries, newsletter, articles…
src/app/api/            stripe/webhook, newsletter(+confirm/unsubscribe), reviews, corporate, admin/upload
src/app/globals.css     design system; component classes in @layer components (.btn, .eyebrow…)
src/components/         brand, layout, home, shop, cart, checkout, custom (basket builder),
                        corporate, account, admin, ui
src/lib/                prisma, auth, permissions, settings, pricing, zones, discounts, stripe,
                        email, cloudinary, rate-limit, turnstile, features, queries, i18n-content
src/lib/actions/        server actions: admin, auth, checkout, delivery, products (+ orders.ts,
                        which is server-only helpers, not actions)
src/i18n/               next-intl routing.ts + request.ts;  src/middleware.ts = intl + admin JWT gate
src/instrumentation.ts  assertStartupEnv() — fails a prod boot with bad AUTH_SECRET / Stripe env
messages/en.json, fr.json   UI copy         prisma/  schema, migrations, seed.ts, zones.ts
scripts/                audit-alcohol, check-stripe, import-products     import/  import working files
tests/                  Vitest suites + helpers (empty.ts aliases "server-only", setup.ts env guard)
```

## Conventions

- **Server actions** live in `"use server"` files under `src/lib/actions/`. Admin mutations call
  `guard(permission)` (re-reads role from DB, checks `src/lib/permissions.ts`) and validate input
  with zod (`parse(schema, input)` / `schema.safeParse`). Throw `Error` with a UI-safe message.
- Modules that must never reach the client import `"server-only"` (email, stripe, tokens, env,
  discounts, rate-limit, actions/orders). Vitest aliases it to `tests/helpers/empty.ts`.
- **Bilingual copy**: UI strings via next-intl `useTranslations`/`getTranslations` from
  `messages/*.json`; some components use `const fr = useLocale() === "fr"` and `fr ? "…" : "…"`
  ternaries. Catalogue/content text is stored as JSON `{ en, fr }` columns and read with
  `t(value, locale)` from `src/lib/i18n-content.ts`. Emails pick EN/FR from `locale`.
- **Money is integer cents.** Totals come from `src/lib/pricing.ts` (`computeTotals`); delivery
  fees come from the resolved `DeliveryZone` (FSA-based, `src/lib/zones.ts`), never a global rate.
  Tax is currently 0 (not GST/HST registered) — see comment in `src/lib/settings.ts`.
- Discount redemptions are reserved atomically (`reserveDiscount` uses `updateMany` with
  `usedCount < usageLimit`) before Stripe and released on expiry/cancel (`src/lib/discounts.ts`).
- **Stripe**: Checkout Sessions with `metadata.orderId`; the webhook (`api/stripe/webhook`) requires
  `STRIPE_WEBHOOK_SECRET` (503 without it) and calls `markOrderPaid` / `cancelOrder` /
  `recordRefund` in `src/lib/actions/orders.ts`. The confirmation page also settles from the session.
- **Emails** (`src/lib/email.ts`): one `send()` returns `boolean` (false when Resend rejects or the
  key is missing — it logs instead of sending). Only `sendEmailVerification` propagates the
  boolean today; the others fire-and-forget. All templates escape user text via `src/lib/html.ts`.
- **Rate limiting** (`src/lib/rate-limit.ts`): named rules in `RATE_LIMITS`; Upstash REST when
  configured, per-instance memory fallback otherwise; fails open on infra errors, never on a breach.
  `verifyTurnstile` (`src/lib/turnstile.ts`) is a no-op until `TURNSTILE_SECRET_KEY` is set.
- List reads in `src/lib/queries.ts` return safe fallbacks when the DB is empty/unreachable, and
  exclude `HIDDEN_PRODUCT_SLUGS` (the paused gift card). Detail lookups (`getProductBySlug`,
  `getArticleBySlug`) and the `getSitemap*` reads rethrow on purpose: an outage must render the
  error boundary (500), never a 404 or an empty sitemap that search engines would believe.
- **SEO**: every storefront `generateMetadata` goes through `pageMetadata()` in `src/lib/seo.ts`
  (canonical, en-CA/fr-CA/x-default hreflang, OG/Twitter, noindex). Structured data goes through
  `<JsonLd>` (`src/components/seo/JsonLd.tsx`). Listing pages share `src/lib/collection-page.ts`
  (pagination via `?page=`, sort → canonical to clean URL, price/recipient filters → noindex,
  empty collection → noindex). Untranslated FR products/guides (`hasFrench` false) get no hreflang
  pair and a noindex FR page.
- Styling: Tailwind utilities + component classes from `globals.css`; plum is the single brand
  colour, 4px radii. Prefer editing existing classes over adding new CSS.
- Comments in the code explain *why* (past bugs, legal constraints). Keep that habit.

## Testing

`npm test` runs 8 suites (~147 tests) covering pricing, discount reservation, the Stripe webhook,
email error handling, rate limiting, city/delivery data, message-catalogue integrity
(`tests/messages.test.ts`: EN/FR key parity, ICU placeholder agreement, checkout copy resolves)
and the SEO layer (`tests/seo.test.ts`: origin, indexing
switch, canonical/hreflang metadata, JSON-LD, sitemap and robots builders). Pattern: `vi.hoisted` mocks + `vi.mock("@/lib/prisma", …)`,
requests built with `new Request(...)` cast to `NextRequest`. Add new tests under `tests/` and keep
them free of network and database access.
