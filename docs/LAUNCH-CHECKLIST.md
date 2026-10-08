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
- [x] **Courier rates repriced from real quotes** (ShipTime, Oct 2026 — `npm run survey:shipping`).
      ON ground $19.99 → $28.99 (+$15.99/extra basket), Northern ON $29.99 → $36.99 (+$16.99): the
      old fees lost ~$9 a parcel once label tax (not HST-registered) and packing were counted.
      Applied to production 7 Oct with `npm run zones:shipping -- --apply`; seed matches.
- [ ] **Canada-wide shipping** — Quebec $28.99, Atlantic $42.99, Prairies $37.99, BC $41.99, Yukon
      and fly-in FSAs (J0M, A0P, R0B, V0T) by quote. Created INACTIVE in production 7 Oct.
      Before `npm run zones:shipping -- --apply --activate`: (1) replace the "across Ontario / Ontario only" copy — page
      titles and descriptions in `src/app/layout.tsx`, shipping page, FAQ, `messages/*.json`,
      occasion/recipient/corporate/gift-card/about/reviews pages, the shipping email label in
      `email.ts`, and the unserved messages in `actions/checkout.ts` + `actions/delivery.ts` (still
      true for NT/NU); (2) untick `shippable` on anything that can't survive 4–6 days in transit
      (chocolate in summer, fresh items, fragile glass).

## 3. Guides (content)

Four guides written and **published live 26 Sept 2026** via `npm run seed:guides -- --write
--publish` (report-only without `--write`; DRAFT without `--publish`). Sources live in
`scripts/guides/`; the seeder sanitises each body with the same allow-list the admin uses and
refuses to run if a guide cross-links a slug that does not exist. Verified live: all four on
/guides, Article + BreadcrumbList JSON-LD, en-CA/fr-CA/x-default hreflang pairs (so `hasFrench`
sees real translations, not copied English), no noindex. They enter the sitemap on its next
hourly revalidate.

Editorial pass before publishing: zero emoji, em dashes cut to 1 per 649 words (EN) and 1 per 963
(FR) from roughly 1 per 85, and repeated crutch words ("rather than" 10x, "actually" 8x,
"réellement" 7x and others) varied down. Re-run that audit on any new guide.

- [ ] **Read the corporate guide.** It states CRA rules (the $500 non-cash employee limit, the
      near-cash gift-card trap, and food gifts being 50% deductible under s. 67.1) under the Velvéa
      name. It carries a "not tax advice, confirm with your accountant" footer, and it is live —
      if any claim does not sit right, unpublish it in Admin -> Articles.
- [ ] Guides link only to collections that hold products. Before publishing, re-check the sitemap —
      `new-parents`, `vegan`, `fresh-fruit`, `baby`, `sympathy`, `new-baby` and `wedding` were empty
      (and therefore noindex) when these were written, so they are named in the copy but not linked.
- [x] **Three more guides published live 4 Oct 2026:** `diwali-gift-hampers-gta`,
      `real-estate-closing-gifts-gta`, `corporate-gift-hampers-how-to-choose`. Same editorial pass
      (no emoji, no em dashes, crutch phrases cut). Verified 200 in EN and FR, listed on /guides,
      no noindex.
- [ ] The Diwali guide hard-codes the 2026 date (Sun 8 Nov), its delivery windows and the
      "order by mid-October" line: update them every autumn in both locales, then re-run with
      `--write --force`.
- [ ] Cover images: every guide has `coverImage` null. They render without one; add photography when
      there is some.

## 4. Google Business Profile

Created 22 Sept under giftsvelvea@gmail.com, service-area listing with the address hidden,
verification in Google's hands (up to 5 days, no promised date).

- [ ] Finish the profile: description, secondary category, attributes, photos, products.
- [x] **Maps URL published (26 Sept 2026).** Verified live: the homepage `sameAs` carries
      `instagram.com/velvea_gifts` and `maps.app.goo.gl/c5iCqHs1jYxqjhgf6`, and the footer renders
      the Instagram button only. Verification
      completed 26 Sept 2026 ("You manage this Business Profile"), so the profile is public. The
      field exists now (`settings.social.googleBusiness`) and feeds `sameAs` in the Organization
      markup; it deliberately gets no footer button. Use the profile's Share link
      (`maps.app.goo.gl/...`) — `canonicalSocialUrl()` strips the tracking query either way.
- [x] **Placeholder social URLs removed (26 Sept 2026).** Instagram (`velvea_gifts`) is the
      only account that exists. `DEFAULT_SETTINGS.social` used to ship guessed handles
      (`facebook.com/velvea`, `pinterest.com/velvea`, `tiktok.com/@velvea`), which the footer
      linked and the Organization `sameAs` published — sending customers to accounts Velvéa does
      not own and pointing Google's entity signal at profiles that never link back. The defaults
      are now empty strings, the footer renders only configured networks, and
      `tests/settings.test.ts` guards against reintroducing a guess. Admin -> Settings confirmed
      the database never stored the placeholders, so no settings edit was needed — deploying is
      what takes effect.
- [ ] **Correct the "no premises" answer.** Studio pickup is real and by appointment (settled
      24 Sept), and free pickup is the qualifying in-person contact. The site copy now says "by
      appointment" everywhere; the profile should match.

## 5. Search and analytics

- [ ] **Set `CRON_SECRET` in two places** — Vercel (Production) and the GitHub repository secrets.
      The same value in both. Abandoned-cart recovery refuses to run until it exists: an endpoint
      that emails customers is not left open. Redeploy after adding it to Vercel; env vars only
      reach a new deployment.
      **Why two places:** the Vercel account is on the Hobby plan, which runs cron at most once a
      day. That is useless here — the reminder has to land inside a 90-minute-to-20-hour window,
      and a daily run would miss most carts. `.github/workflows/abandoned-carts.yml` drives it
      hourly instead; `vercel.json` keeps a daily run as a backstop. Both firing is harmless
      because the endpoint stamps before sending.
- [ ] **Apply the abandoned-cart migration:** `npx prisma migrate deploy`
      (`20260924100000_abandoned_cart` — adds `Order.abandonedEmailAt` and the `EmailOptOut` table).
- [ ] **Move DMARC from `p=none` to `p=quarantine`** once a couple of weeks of reports look clean.
      Today you are monitoring spoofing rather than blocking it.
- [ ] **Decide the real opening hours.** The site says Mon–Sat 9am–6pm ET; the Google Business
      Profile says Mon–Sun 8am–6pm. A NAP mismatch is a genuine local-SEO drag.
- [ ] **Decide whether to track inventory.** All 15 active products are `inventory = null`
      (unlimited), so the "Only N left" and sold-out UI — which is built and correct — never
      appears. Set numbers only where stock is genuinely limited.

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

## 6. Content

- [ ] **Guides have routes but no published articles.** The content plan in SEO-BRIEF §V-12 cannot
      start until something is published. Article bodies are sanitized on save. Owner decision
      24 Sept: Claude drafts them from owner-supplied topics and facts, owner reviews before publish.
      **Waiting on the topic list.**
- [ ] Review the FAQ and delivery copy against the confirmed delivery rules from §1.

## 7. Code — deferred by decision, not forgotten

- [ ] **Custom basket builder — paused 24 Sept, needs real inventory.** Hidden behind
      `CUSTOM_BUILDER_ENABLED = false`. The builder code is sound (checkout re-prices every custom
      basket from the database and enforces capacity, availability and shippability server-side);
      what is missing is the catalogue behind it. Currently 3 containers and 15 add-ons, all seeded
      demo data: no images on any of them, and every French name is a copy of the English. To
      re-enable, add real containers and add-ons with photography, real prices and real French names
      in `/admin/builder`, then flip the flag. Note the `Handwritten card — $5.00` add-on should go
      or be renamed, since cards are now printed and the free card is free.
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
- [ ] **"Brands we carry" on `/partners` — owner content (added 7 Oct 2026).** The page (EN/FR,
      footer "Sell with Velvéa") and its `/admin/partners` inbox are live; showing a few real
      signed brands would make it far more persuasive to the next one. Build once brands exist.

## 8. Migrations — all applied

`20261007000000_brand_partner_inquiry` (adds the `BrandPartnerInquiry` table, additive only) was
applied to production on 7 Oct 2026 with `npx prisma migrate deploy`, after `migrate diff` against
the live database showed that table as the only difference.

`prisma/migrations/20260924000000_drop_order_billing` (drops the never-written `Order.billing`
column) was applied to production on 24 Sept 2026. `npx prisma migrate status` reports
"Database schema is up to date" across all 8 migrations, the Prisma client has been regenerated,
`tsc` is clean and 147 tests pass against it. No data was lost: no row ever held a value, and
Stripe holds the billing address on the payment intent.

Note that the Vercel build does **not** run migrations. Any future migration has to be applied with
`npx prisma migrate deploy` by hand, as this one was.

---

## Done 26 Sept 2026

- **The FAQ was advertising a paused feature.** "Can I build my own basket?" answered "hand-pick
  every item in our builder" for the whole time `CUSTOM_BUILDER_ENABLED` was false, so the answer
  pointed at a page that 404s — and the /faq page builds its `FAQPage` JSON-LD from the same list,
  so search engines were told the same thing. The builder answer now lives in the catalogue as
  `aBuilder` and is selected by `resolveFaqItems()` (`src/lib/faq.ts`), which both the component
  and the JSON-LD resolve through so they cannot drift. The flag-off answer describes the real
  bespoke-by-email route. 5 tests in `tests/faq.test.ts`.
- **llms.txt described a FAQ that does not exist.** It told AI crawlers the FAQ covered "allergens,
  substitutions"; it covers neither. Now lists what is actually there.
- **Social defaults.** `DEFAULT_SETTINGS.social` shipped guessed handles
  (`facebook.com/velvea` and two more) that the footer linked and the Organization `sameAs`
  published. Emptied; the footer renders only configured networks and now supports all four icons.
  A `googleBusiness` field was added and carries the verified profile into `sameAs`.
- **Four guides written** and loaded as DRAFT — see section 3.
- Unused `t` import removed from the admin dashboard; `npm run lint` is clean.

## Done 24 Sept 2026

- **Abandoned checkout recovery.** Hourly Vercel Cron (`vercel.json`) hits
  `/api/cron/abandoned-carts`, which finds `PENDING` orders between 90 minutes and 20 hours old
  (after the customer has really gone, before Stripe expires the session) and sends one reminder.
  CASL: business identification already in the email footer, a plain statement of why it arrived,
  a working opt-out (`/api/email/opt-out`, signed order token, `List-Unsubscribe` header) and an
  `EmailOptOut` table the cron checks. One email per order, ever — `Order.abandonedEmailAt` is
  stamped *before* sending, so a crash costs one reminder rather than sending two. 11 tests.
  **Needs `CRON_SECRET` set in Vercel** — the route returns 503 until it is.
- **Cart drawer accessibility.** It had no `role="dialog"`, no `aria-modal`, no Escape key, no focus
  trap and no focus restoration — all of which `MobileMenu` already did correctly. Now matched.
  It also stayed in the tab order while closed (`aria-hidden` hides from screen readers but leaves
  controls focusable), so a keyboard user tabbed into an invisible cart; `inert` fixes that.
  Hardcoded English in the drawer ("Your bag is empty", "Close", "Remove", "Decrease", "Increase")
  moved to the catalogue.
- **Social URLs sanitised.** `canonicalSocialUrl()` strips query strings and fragments, and
  `getSettings()` normalises on read, so an Instagram QR share token can never again be published
  in the homepage's `sameAs`.

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
