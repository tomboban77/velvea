# Velvea launch checklist — 24 Sept 2026

One list of everything still standing between the current build and a live, indexed storefront.
Pulls together the open ends from [BACKEND-REVIEW.md](./BACKEND-REVIEW.md) (security, money,
correctness) and [SEO-BRIEF.md](./SEO-BRIEF.md) (discovery). Those two stay the detailed records;
this is the running order.

**Where the build stands:** all 25 numbered security/money findings are closed. `npm test` is 147
passing across 8 suites, `tsc` is clean. The application runs end to end with no Stripe, Cloudinary
or Resend keys and against an empty or unreachable database.

**The site is live and indexed.** Verified against production 24 Sept 2026 via `vercel env pull`
and direct HTTP:

| Check | Result |
|---|---|
| `SITE_INDEXING` | `all` — full catalogue open to search engines |
| `X-Robots-Tag` on storefront routes | absent, as designed at `all` |
| Sitemap | 136 URLs |
| `/search`, filtered listings | `noindex, follow` with canonical to the clean URL |
| `velvea.ca` → `www` | single 308, no chain |
| Turnstile | both keys set in production (public forms protected) |
| GA4 / Search Console | `G-G4WZGMMQH5`, verification token set |
| Stripe | live keys (`sk_live_`) |

Treat `.env.vercel.production` as possibly stale — it is refreshed by hand and was 6 days behind
when this was written. `vercel env pull` is the source of truth.

---

## 1. Open — owner calls

The launch gate is passed; these are the promises the live site is already making, so they matter
more now, not less.

- [x] **Launch readiness confirmed** — owner, 24 Sept 2026. The catalogue is intended to be live
      and indexed.
- [x] **`SITE_INDEXING=all`** — already set in Vercel.
- [ ] **Confirm delivery rules as published:** working days and holidays, lead times, same-day
      cutoffs, national exclusions, free-shipping threshold. The checkout enforces whatever is in the
      delivery zones; the marketing copy has to agree with it.
- [ ] **Confirm returns, cancellation, damage and substitution procedures.** The policy pages are
      written and no longer carry template wording, but the promises in them need to be ones you will
      honour.
- [ ] **Decide French scope at launch** and who reviews the UI, product, guide, policy and checkout
      translations. Untranslated FR products and guides already get no hreflang pair and a noindex FR
      page, so partial French is safe — but it should be a decision, not a default.
- [ ] **Evidence for product claims** (dietary, origin, handmade, certifications) before any Merchant
      Center feed. Feed eligibility turns on these.

## 2. Delivery zones

- [x] **Burlington, Georgetown and Bolton moved** into `local-b-west`. Already done in production
      (26 FSAs) — confirmed 24 Sept with `npx tsx scripts/move-delivery-fsas.ts` (dry run).
      Those postal codes now get $14.99, a 13:00 same-day cutoff and 0–1 day lead times.
- [x] **Hamilton stays courier shipping** — owner, 24 Sept. Hub-only, no city page.
- [x] **Seed synced to production.** `prisma/zones.ts` still described the pre-move layout, so a
      reseed would have silently reverted the move. It now matches production exactly (26 / 27 FSAs).
- [x] **`local-c` renamed** — applied to production 24 Sept. It now reads "Local C — Durham,
      north GTA" in both locales; Burlington no longer appears in a zone it is not in.
      `scripts/sync-zone-names.ts` reports clean. Re-run it (report mode is free) after any admin
      zone edit — it is what caught this.

## 3. Google Business Profile

Created 22 Sept under giftsvelvea@gmail.com, service-area listing with the address hidden,
verification in Google's hands (up to 5 days, no promised date).

- [ ] Finish the profile: description, secondary category, attributes, photos, products.
- [ ] Once the Maps URL is public, add it to `settings.social` so it feeds `sameAs` in the
      Organization markup.
- [ ] **Correct the "no premises" answer.** Studio pickup is real and by appointment (settled
      24 Sept), and free pickup is the qualifying in-person contact. The site copy now says "by
      appointment" everywhere; the profile should match.

## 4. Search and analytics

Search Console and Bing are verified, sitemap submitted, GA4 stream G-G4WZGMMQH5 receiving data with
Consent Mode v2 and URL-param redaction.

- [x] **Noindex lift confirmed** 24 Sept against live headers, not just HTML: no `X-Robots-Tag` on
      `/`, `/fr`, `/baskets`, `/delivery`; `/search` and filtered listings still `noindex, follow`.
- [x] **Redirects checked** 24 Sept: `velvea.ca` → `https://www.velvea.ca/` in a single 308, no
      chain or loop. Canonicals self-reference; filtered URLs canonicalise to the clean page.
- [ ] Record the launch in a change log: the switch, affected URLs, checks run, date, who did it.
      The verification table at the top of this file is the raw material.
- [ ] **Merchant Center** — account does not exist. Only worth creating once purchases are real and
      the product claims above are settled.
- [ ] **Performance baseline** — never measured. Take one before optimizing anything.

## 5. Content

- [ ] **Guides have routes but no published articles.** The content plan in SEO-BRIEF §V-12 cannot
      start until something is published. Article bodies are sanitized on save. Owner decision
      24 Sept: Claude drafts them from owner-supplied topics and facts, owner reviews before publish.
      **Waiting on the topic list.**
- [ ] Review the FAQ and delivery copy against the confirmed delivery rules from §1.

## 6. Code — deferred by decision, not forgotten

- [ ] **Gift card issuance and redemption.** Paused behind `GIFT_CARDS_ENABLED = false` and correctly
      hidden from listings, search, sitemap, checkout, nav and admin. Nothing issues, emails or
      redeems a code. Decision 24 Sept: stays paused through launch. The flag is not enough on its
      own — both halves must be built before it flips.
- [ ] **Slug-history redirects** for renamed or removed products. Needs a new table.
      **The reasoning for deferring this was wrong and should be revisited.** It was deferred on the
      belief that nothing was indexed yet — but `SITE_INDEXING` has been `all` since 21 Sept and the
      sitemap advertises 136 URLs, so Google is already crawling product pages. Renaming or deleting
      a product slug from now on produces a hard 404 on a URL search engines know about. The cost of
      waiting is no longer zero. Either build it, or treat product slugs as frozen.

## 7. Migrations — all applied

`prisma/migrations/20260924000000_drop_order_billing` (drops the never-written `Order.billing`
column) was applied to production on 24 Sept 2026. `npx prisma migrate status` reports
"Database schema is up to date" across all 8 migrations, the Prisma client has been regenerated,
`tsc` is clean and 147 tests pass against it. No data was lost: no row ever held a value, and
Stripe holds the billing address on the payment intent.

Note that the Vercel build does **not** run migrations. Any future migration has to be applied with
`npx prisma migrate deploy` by hand, as this one was.

---

## Done 24 Sept 2026

- **Applied to production:** the `local-c` zone rename, and the `drop_order_billing` migration
  (schema verified in sync afterwards, client regenerated, tests green).
- **Gift card copy switched from handwritten to printed** (owner decision). 15 strings in each
  locale, the terms clause in both languages, and the internal comments. The $6.99 premium tier was
  made method-neutral ("with your message inside") rather than "printed", because a pre-folded
  retail greeting card cannot reliably be run through a printer — claiming printed there would
  have replaced one false promise with another. The packing slip still tells the packer to write
  inside the store card, which stays correct for that tier. "Composed / packed by hand" claims
  about the baskets are untouched and still true, as is "no prices on the slip".
- Added `scripts/sync-zone-names.ts` — catches seed-vs-database drift in customer-facing zone names.
- Verified the live indexing state end to end (table above) and corrected the record: the site was
  already launched, not held at homepage-only.
- Confirmed the Burlington/Georgetown/Bolton move was already applied in production, and synced
  `prisma/zones.ts` so a reseed cannot undo it.
- Added `scripts/move-delivery-fsas.ts` — dry-run by default, `--apply` to write, one transaction.

- Pickup copy reads "by appointment" across EN and FR (6 strings), and the contact page labels the
  studio address as appointment-only, so nothing reads as a walk-in storefront.
- Per-collection product ordering: admin panel plus storefront ordering through
  `ProductCollection.position`.
- Builder container saves no longer reset their position to 0.
- Checkout copy moved onto the message catalogue (42 call sites), guarded by a new test suite that
  fails on a missing key, an empty French string or a mismatched ICU placeholder.
- A failed `stripeSessionId` write no longer cancels an order that has a live, payable Stripe
  session.
- `Order.billing` removed from the schema; migration staged.
