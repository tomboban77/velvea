# Velvéa — SEO audit and launch brief

**Reviewed:** 2026-09-18. Replaces the 2026-09-12 brief.
**Production:** https://www.velvea.ca/ — owner confirmed.
**Stage:** still being set up; not accepting real orders — owner confirmed.
**Decision:** keep the unfinished catalog out of search until launch — owner confirmed.
**Implementation status:** the technical layer below was implemented in code on 2026-09-21 (see section 0). Nothing is deployed until the owner pushes and sets `SITE_INDEXING` in Vercel. Owner-dependent items in section 3 remain open.

## 0. Implementation status — 2026-09-21

All code lives in `src/lib/seo.ts` (pure, unit-tested in `tests/seo.test.ts`), `src/components/seo/JsonLd.tsx`, `src/lib/collection-page.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/middleware.ts`, and each page's `generateMetadata`.

| Ticket | Status | What was done |
|---|---|---|
| V-00 pre-launch control | **Done (code)** | `SITE_INDEXING` env: unset/`off` (default) = every storefront page `noindex, follow` via metadata **and** `X-Robots-Tag` from middleware, sitemap empty; `home` = homepage only; `all` = launch. robots.txt keeps crawling allowed so the noindex can be read. Documented in `.env.example` and CLAUDE.md. **Owner must set the value in Vercel** (see section 3). |
| V-01 / V-02 / V-18 / V-21 / V-23 | **Done** | `pageMetadata()` on every storefront page: self-canonical, `en-CA` / `fr-CA` / `x-default` hreflang, per-page OG url/title/description/image/locale, Twitter card, translated titles + descriptions (`messages/*.json` → `meta.*`). next-intl `alternateLinks: false` (no conflicting `en`/`fr` Link headers) and `localeDetection: false` (stable `/`). Products/guides whose FR copy equals the EN copy (`hasFrench`) get no hreflang pair and a noindex FR page. Origin is validated on the production deployment (`VERCEL_ENV=production`): https, not localhost. |
| V-03 Product JSON-LD | **Done** | Availability from inventory/variant stock (same rule as the sold-out button); one Offer per variant with its own price; `url`, `sku`, zero-review aggregate omitted; `<` and U+2028/9 escaped. Not done: `shippingDetails` / `hasMerchantReturnPolicy` (needs confirmed policy — section 3). |
| V-04 Organization / WebSite | **Done** | Emitted from the locale layout using effective settings (admin overrides). Contact/social values are whatever settings hold — owner must verify them (section 3). |
| V-06 Breadcrumbs / CollectionPage | **Done** | `BreadcrumbList` on product and guide pages; `CollectionPage` + `ItemList` on /baskets and every collection page (clean, unfiltered views only). |
| V-07 FAQPage | **Done** | `/faq` emits `FAQPage` from the same message items the component renders. |
| V-08 Article markup | **Done** | `Article` with author, `datePublished`, `dateModified`, `inLanguage`; OG `type: article`; CTA and byline localized. |
| V-09 outage vs absence | **Done** | `getProductBySlug`, `getArticleBySlug` and the sitemap reads rethrow on DB error → error boundary / failed sitemap fetch, never a 404 or an empty catalogue. Listings keep their empty-state fallback. |
| V-10 social previews | **Done** | Per-page OG + Twitter through `pageMetadata()`; brand card fallback. |
| V-13 internal links | Already done | Footer, mega-menu, breadcrumbs, related rail. |
| V-19 sitemap | **Done** | One entry per locale per path with language alternates; no caps; empty collections, paused gift card and untranslated FR pages excluded; `lastModified` only from real record dates; no priority/changefreq; hourly revalidate. Fails (500) on DB error. |
| V-22 URL policy | **Done** | Server-rendered pagination (`?page=`, 48/page, real links, stable `createdAt,id` tie-breaker) on /baskets and all collection pages; out-of-range page → 404. `sort` → canonical to clean page; `min`/`max`/`recipient`/`q`/guides `category` → noindex; empty collection → noindex; /search noindex and no longer robots-blocked; utility pages noindex + disallowed in both locales. Not done: redirects for renamed/removed products (needs slug-history storage → schema change; decide). |
| V-15 ownership / analytics | **Done (code)** | Vercel Analytics + Speed Insights already present. `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` emit the ownership meta tags when set. GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) loads with Consent Mode v2 all-denied; the storefront consent banner grants `analytics_storage` on accept and remembers the choice; ad signals stay denied; privacy policy gains GA paragraphs only when GA is configured. Owner sets the three env vars in Vercel. Bing has no analytics product beyond Webmaster Tools (verification covered) and Microsoft Clarity (not added). |
| L-03 LocalBusiness | **Closed — not applicable** | Owner confirmed 2026-09-21: online-only, no premises customers can visit. Organization markup carries `areaServed: Ontario` instead. Owner to check the FAQ "pickup from our Mississauga studio" claim and the PICKUP zone against that. |
| V-20 guardrails | **Done** | `tests/seo.test.ts` (33 tests): origin, indexing switch, canonical/hreflang, OG, noindex rules, `hasFrench`, JSON-LD escaping, product availability/variants, sitemap and robots builders, pagination policy. |
| V-11 llms.txt, V-16 Merchant feed, V-14 performance baseline, V-12 content plan | **Not started** | Depend on owner answers (crawler policy, purchase readiness) or on measurement. |

## 1. Assessment and evidence

The original brief had useful foundations, but should not be executed unchanged. Several repository findings are stale; some technical instructions conflict; others promise SEO effects without evidence. First control pre-launch exposure and make business/product information accurate. Add discovery, measurement, and useful content around a verified launch inventory.

This revision is based on repository inspection, limited anonymous production HTTP checks, current official documentation linked below, and owner answers. Configuration and website copy show what is published, not whether a business promise is true.

Not inspected: Search Console, Bing Webmaster Tools, Merchant Center, Business Profile, analytics accounts, private database records, server crawl logs, completed checkout, field performance, competitors, or keyword demand. Account existence, actual indexing, rankings, backlink authority, and keyword volumes remain unknown. Environment secrets were not needed.

The application uses Next.js 15.5.25, App Router, next-intl, Prisma, and English/French routes. English is unprefixed; French uses `/fr`. GrowMint may provide examples, but is not authoritative evidence for this site's architecture, operations, indexing diagnosis, or expected results.

### Production sample

Read-only HTTP requests, 2026-09-18 around 04:56–04:59 UTC. HTML was fetched without executing JavaScript. This is not a full crawl or rendered-browser/performance audit.

| Surface | Observed result | Interpretation |
|---|---|---|
| `/` | `200`; no canonical, `og:url`, or robots noindex found in fetched HTML; no `X-Robots-Tag` in captured headers | Homepage currently has no observed indexing exclusion. This does not prove it is indexed. |
| `/fr` | French `html lang`; English title/description/OG copy | Metadata localization is incomplete. |
| Homepage HTTP headers | `Link` alternates for `en`, `fr`, `x-default` | Hreflang already exists. The old “none” finding is false. |
| `/` with `Accept-Language: fr-CA` | `307` to `/fr` | Automatic language redirection is live. |
| `https://velvea.ca/` | `308` to `https://www.velvea.ca/` | This sampled redirect is correct; other variants still need testing. |
| `/robots.txt` | Crawling allowed; utility exclusions cover unprefixed routes only | French account/checkout/order/search paths are not covered by those rules. See crawl/noindex distinction below. |
| `/sitemap.xml` | 59 URL entries, six product URLs, no French `<loc>` entries; French alternates exist | Public sitemap inventory only, not a database count. |
| `/products/blush-bloom-self-care-basket` | `200`; no canonical found; Product/Offer JSON-LD, CAD 159.00, `InStock` | Markup exists; actual purchasability is unconfirmed and real orders are not being accepted. |
| Same product title | Ends with `Velvea · Velvea` | Stored SEO title and global suffix duplicate the brand. |
| `/fr/shipping` | `200`; English heading/main content under `lang="fr"` | French readiness is visibly incomplete. |
| Social metadata | Home, sampled product, and French shipping emit `twitter:card=summary_large_image`; root image is `/brand/velvea-og.png?v=6` | Old “no Twitter card / logo-only OG” finding is stale. Visual preview quality remains untested. |
| Homepage caching | `private, no-cache, no-store` | One observed response, not a measured performance problem across the site. |

The web research tool could not fetch this domain; direct HTTP requests succeeded. Do not report the research-tool failure as a site outage.

### Repository findings

**P0:** address before exposing unfinished commerce pages. **P1:** address before requesting launch-page indexing. **P2:** subsequent improvement, prioritized by evidence.

| Priority | Finding | Evidence and implication |
|---|---|---|
| P0 | No coordinated pre-launch indexing gate found | Reviewed root metadata, robots, sitemap, and live sample. Owner wants unfinished catalog excluded. |
| P0 | Product schema hardcodes availability | `src/app/[locale]/products/[slug]/page.tsx` always emits `InStock`; `ProductDetail.tsx` considers product inventory and variant stock. |
| P0 | Schema price can differ from initial variant | JSON-LD uses base `priceCents`; product UI selects the first variant and uses its price. Code-path risk; no live mismatch demonstrated. |
| P0 | Data outages can resemble missing content | `src/lib/queries.ts` catches errors and returns null/empty lists. PDP/articles can produce `notFound()` and listings/sitemap can become empty. Persistent caching could retain failed results. |
| P0 | Defaults are not verified business facts | `settings.ts` has a `555-0142` phone, address, social URLs, and delivery values. `getSettings()` merges database overrides. Live homepage did not contain that placeholder phone. Do not equate defaults with production data. |
| P0 | Policy/delivery copy needs owner review | Privacy/terms explicitly contain template/review-before-publishing wording. Shipping promises express options; `computeShipping()` has no express method branch. |
| P1 | Canonicals and page-specific OG URLs absent | No implementation found in `src/app` or sampled HTML. Root has no `og:url`; old claim that every page inherits homepage `og:url` is inaccurate. |
| P1 | Metadata commonly inherited/untranslated | 31 localized page templates; nine `generateMetadata` functions; only product/article functions supply descriptions. Others commonly inherit root description, rather than having no description at all. |
| P1 | Sitemap incomplete/misleading | Caps at 500 products/200 articles; only English `<loc>`; current-time fallback dates; navigation collections listed without checking usefulness/readiness. |
| P1 | French risk is in UI/code and database | English support/legal text and titles, English phrases in collection metadata, English guide CTA. `t()` falls back for absent locale properties but preserves empty strings; `localized()` copies English into empty French fields. Message-key parity is insufficient. |
| P1 | Utility noindex coverage incomplete | Checkout/order and several account routes already have noindex. Search, account login/register, and admin login need review. Extend existing controls. |
| P1 | JSON-LD serialization needs escaping | Raw `JSON.stringify` is inserted into a script. Escape `<` or use a vetted safe serializer to prevent embedded `</script>` from terminating the block. |
| P1 | Delivery definition duplicated | Server list: 18 entries/17 unique strings; client: 17. Entries include districts/localities, not 17 separate municipalities. `SameDayNotice` uses client defaults and renders its promise after mounting. |
| P1 | Same-day eligibility needs alignment | Checkout's same-day branch returns before later lead-time validation. Notice lacks product lead-time/operating-calendar logic. Confirm rules before advertising deadlines. |
| P2 | Pagination not connected | Baskets/collections request 48 products; Listing has no pagination. Query helpers already support `skip`/`take` and totals. Current sitemap has six products; overflow is a growth risk, not established current loss. |
| P2 | Caching needs route-specific decisions | 15 public marketing/catalog templates have `force-dynamic`, excluding account/checkout/order/search and including disabled gift cards. Not every page does. Locale static params and admin invalidation already exist. |
| P2 | Images/reveals need measurement | Listing prioritizes first five cards; cards already have `sizes`. CSS `.js .reveal` initially hides reveal content. No Lighthouse/field regression was measured. |

Preserve active-product listing filters, hidden gift-card exclusions, approved-review filtering, rating recalculation, visible breadcrumbs, locale-aware links, primary image alt text, decorative empty alt text, and AVIF/WebP support. PDP rendering already rejects DRAFT; align the broader query used by metadata with public visibility rules.

## 2. Corrections to the original advice

These replace the earlier instructions.

| Previous claim | Corrected guidance |
|---|---|
| HTML hreflang is stronger than sitemap | HTML, HTTP headers, and sitemap annotations are equivalent to Google. Keep eligible alternatives consistent. [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions). |
| Query parameters never belong in canonicals | Pagination and some variant designs legitimately use them. Page 2 needs its own canonical. [Pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading). |
| Canonical every filter to parent and noindex it | Exclusion and duplicate consolidation differ. A narrower selection is not automatically a duplicate. Use the URL policy below. [Canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). |
| Disallow plus noindex guarantees removal | A crawler must fetch noindex to see it; robots blocking can prevent that. Neither secures private data. [Noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing). |
| All public pages must become static | Dynamic server-rendered pages can be indexed. Caching is a performance/freshness decision. [Next.js 15 caching](https://nextjs.org/docs/15/app/guides/caching). |
| AggregateOffer is preferable for size variants | Merchant listings require Offer; snippets have different support. Evaluate real variants with ProductGroup guidance. Variant SKUs already exist in the model. [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing), [variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants). |
| Shipping/returns are universally required Product fields; set expiry one year ahead | Requirements differ by feature/channel. Distinguish optional warnings from errors; never invent policies or expiry dates. [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing). |
| FAQ/HowTo schema is a major rich-result opportunity | FAQ rich results stopped appearing May 7, 2026; HowTo was retired in 2023. Helpful Q&A is still useful content. [Current changelog](https://developers.google.com/search/updates), [HowTo retirement](https://developers.google.com/search/blog/2023/08/howto-faq-changes). |
| Require SearchAction and collection carousels | Sitelinks search box was removed in 2024; generic ItemList alone does not establish product carousel eligibility. [Search box retirement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box), [carousels](https://developers.google.com/search/docs/appearance/structured-data/carousel). |
| llms.txt and allowing training bots are mandatory | Google requires no special AI file/schema. OpenAI search and training controls are independent. [Google AI guidance](https://developers.google.com/search/docs/appearance/ai-features), [OpenAI crawlers](https://developers.openai.com/api/docs/bots). |
| Missing Bing verification in code proves a ChatGPT blocker | Account ownership cannot be inferred from source. Remove unsupported single-index explanations of ChatGPT search. Bing is useful; its absence is unverified. |
| Every guide requires a human Person author | Use actual authorship; Person and Organization are supported. [Articles](https://developers.google.com/search/docs/appearance/structured-data/article). |
| 700 words makes a city page valid; templates make it spam | Distinct usefulness, truthful details, and avoiding doorway/scaled-content abuse matter. No word-count floor. [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies). |
| Fail CI above 60/155 title/description characters | Editorial heuristics are not Google limits. Review meaning, duplication, language, and likely truncation. [Snippets](https://developers.google.com/search/docs/appearance/snippet). |
| Renamed JS/deploy frequency explains this site's delayed indexing | Not established. Diagnose this site's responses, content, links, and crawl/index reports. [Crawl budget](https://developers.google.com/crawling/docs/crawl-budget). |
| Geotag photos, enforce review velocity, promise ranking dates | Remove unsupported thresholds/promises. Google's local guidance emphasizes relevance, distance, and prominence. [Local ranking](https://support.google.com/business/answer/7091). |
| Byte-identical NAP/public address everywhere | Keep underlying identity accurate; ordinary formatting differences are not automatically separate entities. Protect non-public addresses. [Business representation](https://support.google.com/business/answer/3038177). |

Also remove claims that stock photos cannot rank, only guides earn links, identical related-product rows have no link value, homepage empty path versus `/` inherently creates duplicates, every heading needs a number, or each schema mistake causes a manual action. File-based Next metadata has higher priority than config metadata, contrary to the old OG-image explanation. [Next.js metadata](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata).

## 3. Owner decisions still needed

Confirmed: production domain, setup stage, and exclusion of unfinished catalog until launch. Do not interpret “setting everything up” as evidence that each external account is absent.

| Unanswered question | Dependent work |
|---|---|
| Which Search Console/Bing/Merchant Center/Business Profile accounts already exist and who manages them? | Ownership, baseline, submissions |
| Any finished pages to keep discoverable before launch? What defines launch readiness/date? | Exact pre-launch route inventory/switch |
| Correct public brand spelling, legal entity, contact details, social profiles, location, and publishable address? | Identity, contact/policy content, local schema |
| Staffed customer visits/pickup? In-person delivery versus third-party carriers only? | Business Profile eligibility/type |
| Priority regions and buyers: local consumers, national, corporate, or mix? Which products are ready? | Research and launch-page priorities |
| Real areas/fees/cutoff, working days/holidays, lead times, express options, national exclusions, free-shipping rules? | Copy, checkout, shipping data |
| Approved returns/cancellation/damage/perishables/substitution/support procedures? | Commerce/policy launch |
| French at launch or later? Who reviews UI, product, guide, policy, and checkout translations? | French indexing and alternates |
| Evidence for dietary/certification/origin/handmade/sustainability claims? Regulated products? | Product copy and feed eligibility |
| Preferred analytics/consent approach, privacy reviewer, and training-crawler policy? | Measurement and separate crawler permissions |

Independent work: URL helpers using confirmed origin, metadata plumbing, exclusion design, sitemap mechanics, serialization, consistency tests, and draft research inventory. Dependent business claims remain unset until answered.

## 4. Launch-critical specification

### A. Pre-launch control — new V-00, P0

Owner decision: keep unfinished catalog out of search. This review records that decision; it has not activated it.

1. Define centralized indexing state and an explicit inventory of unfinished products, catalog/collections, and commerce landing pages in both locales. Use a safe non-indexable default for unfinished commerce and preview deployments. Define any finished homepage/announcement exception explicitly.
2. Emit crawlable noindex via metadata or `X-Robots-Tag`; omit affected URLs from sitemap and language-alternate declarations. Do not replace noindex with a blanket robots disallow. Private staging may use authentication.
3. Do not submit unfinished inventory to Merchant Center or request indexing. Public offers must not imply immediate purchasability through a non-operational purchase flow.
4. Keep private customer/order data authenticated regardless of launch state. Noindex is not access control.
5. Document the launch switch, deployment step, invalidation, and rollback. Missing configuration must not expose unfinished inventory.

**Done when:** representative unfinished EN/FR URLs return noindex on production and disappear from sitemap/alternates. A controlled launch test removes exclusion only for ready URLs. Existing indexing must be checked separately; removal is not instantaneous.

### B. URLs, metadata, languages — V-01, V-02, V-18, V-21, V-23, P1

Create a shared normalized production-origin/URL module. Reject invalid/localhost production origins. Keep preview/indexing state separate. Use effective runtime settings for mutable business information, not verified-looking exports of `DEFAULT_SETTINGS`.

Build a metadata helper accepting path, locale, title, description, image, indexability, and eligible alternates. Cover routes with static metadata and inherited values, not only `generateMetadata`. Do not put a homepage canonical in a root layout that all descendants inherit.

Distinct ready pages and real translations get self-canonicals. Set page-specific OG URL/text/image/locale. Resolve duplicated branding by defining whether stored titles are unbranded or deliberately absolute. Preserve needed nested metadata fields explicitly; Next performs shallow merging. Test file-based image precedence rather than copying the old `ownCard` assumption.

Hreflang already comes from next-intl response headers. Choose a controlled implementation that can omit unready translations/pages. If adding content-aware HTML/sitemap alternatives, disable conflicting automatic headers using `alternateLinks: false`. Set `localeDetection: false` for stable canonical URLs and keep a visible switcher with real links. A stored cookie will not automatically drive redirects with detection disabled. [next-intl routing](https://next-intl.dev/docs/routing/configuration).

Audit both code/UI and database translations: names, descriptions, contents, titles, guides, policies, checkout, and errors. Separate absent, empty, and English-copied French values. Proper names may legitimately match. Public unfinished translations should be noindex and excluded from eligible alternates; do not mechanically canonicalize all French to English. Translation tools can assist, but competent review is required.

Use existing Product/Collection/Article SEO fields. Write relevant localized titles/descriptions without unconfirmed claims or rigid length tests. Stored collection SEO fields already exist and should not be replaced with navigation fallbacks as the editorial source of truth. Meta keywords should not be treated as a Google ranking tactic.

**Done when:** full HTML/headers for home, collection, product, guide, utility, missing-page, and pagination cases show correct URLs, language, indexability, and reciprocal eligible alternatives. French pages submitted for indexing have reviewed French main content. Test language headers/cookies, switcher, `/en` normalization, and metadata streaming behavior for relevant crawlers.

### C. Truthful commerce and reliable rendering — V-03, V-05, V-09, L-01, P0/P1

Fix hardcoded InStock and potential base-price/default-variant disagreement first. Use one authoritative purchasable-product representation across visible UI, schema, later feed, and server checkout validation. Include actual currency/price/stock, representative crawlable images, URLs, and assigned identifiers. Never invent GTINs, SKUs, reviews, policy terms, or price expiries.

Model real variants using supported ProductGroup/Offer patterns and URLs that actually select the advertised variant. Distinguish meaningful variant parameters from tracking parameters. Choose canonical behavior according to single-page versus separate-page variants. [Product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

Use approved review aggregates across all approved records, not only the 12 loaded by the slug query. Preserve recalculation and test approval/rejection/deletion/no-review states and invalidation. Omit zero-review aggregates. Self-hosted organization/business reviews do not automatically qualify for business stars. [Review guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).

Escape `<` or use a vetted serializer in shared JSON-LD output. [Next.js JSON-LD guidance](https://nextjs.org/docs/15/app/guides/json-ld).

Consolidate delivery definitions; deduplicate North York, distinguish districts/aliases from municipalities, and confirm whether province/postal checks are required. Do not invent postal prefixes or per-city cutoff tiers. Use effective fees/cutoffs and a shared product/date/operating-calendar eligibility rule for copy, countdown, checkout, and later feeds. Current free threshold applies to national SHIPPING, not local methods. Confirm real rules before promising free or same-day delivery.

Separate data outage from absent content. Do not persist failed empty/404 results; provide observable transient-error behavior and preserve a last successful cached result where feasible. Then evaluate rendering per route: root locale calls, translations, searchParams, layout queries, and sessions can affect caching. Reading server searchParams does not make only the query variant dynamic while automatically leaving the bare URL static. Do not move an entire future catalog into the client just to get static build output.

Audit existing invalidation for both locales and product/collection pages, cards/navigation, sitemap, and future feeds. Include price/stock/status/slug/settings, review/article deletion, and payment/order stock mutations. Request memoization differs from cross-request caching. Choose lifetimes from actual update needs. Dynamic server rendering remains acceptable. [Next.js 15 caching](https://nextjs.org/docs/15/app/guides/caching).

**Done when:** fixtures for stocked/sold-out/variant/discount/zero-review products agree across surfaces; rejected reviews disappear; delivery boundaries agree; a simulated data outage does not become a durable empty catalog/false 404; mutations refresh relevant surfaces within the agreed limit; private data never enters shared caches. Product feature tests have no required-property errors; Google displaying stars is not an acceptance criterion.

### D. URL policy and sitemap — V-19, V-22, P0/P1

Pre-launch exclusion takes precedence over this launch policy.

| URL type | Intended launch behavior |
|---|---|
| Ready product/useful collection/home/corporate/custom/guide/support | Crawlable 200, self-canonical, indexable; sitemap according to ready inventory |
| Pagination `?page=2` | Crawlable links, self-canonical including page; sitemap optional; never canonicalize every page to page 1 |
| Tracking/equivalent sort-only variants | Canonical to equivalent clean page; clean internal links; avoid multiplying combinations |
| Uncurated filters/internal search | Crawlable noindex when exclusion is required; no sitemap/alternates; do not call every distinct subset a parent duplicate |
| Researched useful filter landing page | Explicit editorial decision, stable URL, distinct offer/content, self-canonical, relevant links |
| Account/login/register/checkout/order/admin utility | Authenticate sensitive data, noindex public utilities, no sitemap/alternates; coordinate crawl access so needed noindex can be read |
| Empty valid collection | Retain useful seasonal content or noindex a thin placeholder; no blanket deletion of established seasonal URLs |
| Temporarily sold-out product | Useful 200 with accurate availability/alternatives |
| Permanently removed/renamed product | Genuine replacement redirect if appropriate; otherwise 404/410; update links/sitemap/feed; no blanket home redirects |
| Missing/invalid route | Verify status and streamed/not-found behavior avoid indexable soft 404s |
| Unfinished locale/preview | Noindex/protection and no discovery submissions |

Validate pagination/filter/sort inputs to avoid unbounded URL combinations. Robots rules must cover both locales and be tested by user-agent group. Do not block a URL whose noindex must be read, or treat robots as privacy protection.

Enumerate all eligible sitemap entities without silent 500/200 caps. Apply status, hidden feature, locale, and launch readiness. If using sitemap hreflang, emit separate entries for each eligible locale. Use actual significant modification dates or omit unknown lastmod; not generation-time dates. Images are useful optional sitemap data. Google ignores priority/changefreq. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Measure collection sizes. Pagination is urgent if launch inventory exceeds 48, otherwise a growth task. Existing skip/take support needs validated page input, stable ordering/tie-breaker, totals, real links, and meaningful filter-state preservation. Raising a hard cap alone is not a lasting solution.

**Done when:** parsed sitemap matches eligible inventory; no redirects/noindex/missing/hidden/unready URLs. A fixture with more than 48 products remains reachable with JS disabled, without duplicate/missing products across pages. Test meaningful query canonicals, empty/seasonal collections, removals, and failures. Search Console exclusions are investigated rather than promised to be zero.

## 5. Remaining implementation tickets

Original IDs retained for traceability. Work order is in section 7; this is not a mandatory list of every schema type to add.

### V-04 — Organization and website identity · P1

Add safely serialized Organization (or appropriate online-store subtype) and WebSite nodes with stable IDs, confirmed name/URL/logo, and verified identity profiles. Homepage placement can establish identity; repeating all nodes everywhere is not a ranking requirement.

Physical Store/LocalBusiness data requires confirmed operations and a publishable address. Business Profile verification itself is not a prerequisite for truthful website schema. A phone regex is not entity verification. Drop required SearchAction, speculative expertise lists, and forced WebPage coverage.

**Done when:** no placeholders/private address/unverified profiles; consistent IDs; applicable required fields validate. Use a general schema validator for generic types and Rich Results Test for supported Google features.

### V-06 — Breadcrumbs and collection semantics · P1/P2

Generate BreadcrumbList from visible breadcrumbs with absolute locale-correct URLs, particularly products, collections, and guides. Optional ItemList describes only displayed products in displayed order; no promised product carousel.

**Done when:** breadcrumb labels/order/links match UI and locale, valid supported markup, no hidden inventory included.

### V-07 — Useful questions and answers · P1 content / optional markup

Review existing FAQ against actual customer needs and confirmed policies. Add collection-specific answers where useful. Dietary claims, hospitals, deadlines, and corporate minimums need confirmation. Direct wording helps; not every answer needs a number. FAQ markup is optional semantics, not a Google rich-result or launch requirement following the 2026 retirement.

**Done when:** visible accurate answers agree with checkout/policies and are reviewed in each indexed locale; any markup matches the answers.

### V-08 — Guides and editorial trust · P2

Publish guides addressing researched needs, with relevant product/collection links, actual Person or Organization authorship, truthful dates, appropriate imagery, and Article/BlogPosting markup. Use existing article SEO description with excerpt fallback; localize current English CTA/byline text. [Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article).

RSS is optional after a maintained publishing program exists. If implemented, define refresh/invalidation; force-static alone does not make a feed current.

**Done when:** content, author, language, dates, metadata, and links agree. No invented byline, fixed word quota, or mandatory RSS launch gate.

### V-10 — Social previews · P2

Inspect the existing OG asset and live Twitter tags before generating replacements. Supply relevant localized text/images for home, collection, PDP, and guide shares. A 1200×630 image is a useful preview target, not a ranking requirement. Generated image routes are optional.

**Done when:** actual preview checks show correct accessible image/title/language; page-specific cards do not unexpectedly revert to the global image.

### V-11 — AI discovery and optional llms.txt · P2

Prioritize accurate accessible text and links. Google requires no special AI file/schema. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features).

llms.txt is optional without a ranking/citation promise; it must not expose unfinished inventory or stale business facts. Separate search access from training preference: OAI-SearchBot and GPTBot controls are independent. Avoid bot-specific blanket allows that override sensitive-path exclusions. [OpenAI crawler controls](https://developers.openai.com/api/docs/bots).

**Done when:** approved search access works at robots and hosting layers after launch; training preference recorded separately; optional files consistent. Chatbot answers are observations, not deterministic tests.

### V-12 — Research-led content plan · P1 planning / P2 expansion

Confirm offer and demand before commissioning ten long collection articles or three city pages. Build this inventory:

`query/topic | locale | intent | existing URL | eligible products | commercial priority | demand source/date | observed search-result types | gap | next action`

Birthday, sympathy, corporate, recipient, and delivery topics are hypotheses from navigation/catalog, not validated priorities. Research actual launch regions/languages and result types. Label keyword estimates by source/date/location/language. Search Console helps once impressions exist; no pre-launch data does not establish no demand.

Map each distinct intent to a primary page, preserve useful existing URLs, and consolidate overlapping thin collections. Write useful selection guidance, real contents/options, restrictions, delivery conditions, and relevant questions. Put supporting detail where it helps shopping; no mandatory long introduction above every grid. Substantiate claims and use accurate photography.

Reuse Collection SEO fields. A computed price band must represent actual purchasable products/variants. Maintain seasonal pages when useful rather than creating new dated URLs every year.

**Done when:** prioritized launch-page map has evidence and owner-confirmed region/product focus; each page serves a distinct customer need. No invented volumes, word floors, guaranteed rankings, or mass occasion × recipient × city pages.

### V-13 — Navigation and internal discovery · P1

Every ready product needs a crawlable path from ready catalog content. Add relevant breadcrumbs, collections, editorial links, and related products where useful. Shared related sets are acceptable in a small catalog; audit broken/orphan URLs instead of arbitrary three/four-link minimums.

**Done when:** a link crawl reaches ready inventory without forms, button clicks, or sitemap-only discovery. Disabled gift cards and missing locale pages stay out of navigation.

### V-14 — Measured performance · P1 baseline / P2 optimization

Measure production home, collection, and PDP on mobile/desktop using repeatable lab runs; add field data when traffic permits. Good field targets at the 75th percentile are LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. A Lighthouse score alone does not establish these. [Web Vitals](https://web.dev/articles/vitals).

Measure the actual LCP element; it need not be an image. Review first-five-card preloads, responsive images/layout, fonts, JS work, and reveal behavior. Essential content must remain visible under delayed/failed hydration. Static delivery terms belong in server HTML; countdowns should only enhance accurate authoritative rules.

**Done when:** baseline and comparable post-change results recorded; no material visual/interaction regressions; essential content available without hydration. Report absent field data honestly.

### V-15 — Ownership, analytics, and discovery · P1

Confirm existing accounts before creating duplicates. Verify Search Console/Bing where needed; record security/manual-action status, sitemap processing, canonical choice, and URL indexing observations. Ownership can be verified before launch; submit only ready URLs.

Choose analytics with the owner. If GA4 is chosen, implement applicable view_item, add_to_cart, begin_checkout, purchase, and corporate inquiry conversions. Deduplicate purchase events with stable transaction IDs; verify against successful orders; exclude personal data. Align tracking with the approved consent/privacy approach. Do not infer legal requirements merely from a French URL or QC tax constant.

Current CSP does not include Google analytics script/collection endpoints. Adjust the minimum needed directives for the chosen integration. Test declined/granted/changed consent as applicable, event value/currency, production config, and duplicate prevention.

IndexNow is optional. Notify eligible changed/deleted URLs after successful publication/invalidation, not blindly at postbuild before deployment. Handle retries and HTTP 200/202 semantics; acceptance is not proof of indexing. [IndexNow protocol](https://www.indexnow.org/documentation).

**Done when:** ownership evidenced, ready sitemap submitted at launch, relevant conversion events tested, limitations recorded. No daily indexing-request quota or promised indexing date.

### V-16 — Merchant Center readiness · P1 after purchase readiness

Confirm account ownership, website verification/claim, countries/languages, shipping/returns, and actual ability to buy. Draft product data before launch; submit purchasable inventory when ready.

Use stable IDs independent of slugs. Match language, selected variant, price, availability, shipping, and imagery. Taxonomy depends on actual contents: this catalog includes self-care/beauty items, so not every basket is food. Supply identifiers only when assigned; do not fabricate GTINs or misuse identifier_exists.

Configure language in the data-source setup; do not invent a g:language product attribute. Follow applicable variant/grouping/bundle rules. Shipping thresholds and regional exclusions must represent multi-item carts accurately. [Product data specification](https://support.google.com/merchants/answer/7052112).

**Done when:** representative feed/landing-page comparisons pass, blocking account/item diagnostics are resolved, and policies/purchase flow match. Valid data does not guarantee free-listing exposure.

### V-17 — Local program

See section 6. Local SEO is part of the overall search program, conditional on actual operations and eligibility.

### V-20 — Automated guardrails · P1 alongside changes

Use meaningful fixtures for URLs, readiness, offers, and publication states plus HTTP checks against a controlled production build. Inspecting static .next/server/app files alone misses dynamic routes and streamed metadata.

Block regressions in noindex/launch state, canonical origin/path, alternate readiness/reciprocity, public-status filters, sitemap eligibility, safe/valid JSON-LD, offer/review consistency, key navigation, and mutation freshness. Cover both locales.

Warn about descriptive metadata quality, headings, and meaningful-image alt gaps. Do not fail builds on arbitrary character counts, word quotas, heading counts alone, or inbound-link floors.

**Done when:** tests catch broken fixtures; lint/typecheck/relevant build checks pass without private production data. Record manual rich-result/social-preview checks separately.

## 6. Conditional local and external work

L-01 delivery consistency is in section 4C; V-17 refers to this section.

### L-02 / L-07 — Delivery hub, selective pages, and links · P2

First decide whether existing shipping content adequately covers confirmed service areas; a separate delivery hub is optional. Publish a city page only with real service, distinct useful information, relevant demand, and eligible products. Mississauga/Brampton/Toronto are candidates, not approved priorities or proven highest-volume queries.

State actual coverage/restrictions, fees, and fulfillment. Do not invent pickup, hospital/condo handling, neighborhoods, or local experience. Link useful pages from relevant shipping/contact/product copy. No mass geography pages or word/link quotas.

**Done when:** each page has a distinct purpose, verified facts, useful shopping path, and relevant incoming links. No requirement to make a page for every served locality.

### L-03 — Local/service markup · P2, conditional

Use appropriate geography types for real areas. Service markup is optional, not a rich-result/local-ranking guarantee. Reference the organization if a qualifying public LocalBusiness node does not exist. Check Google-supported Canadian shipping geography before encoding postal rules; generic schema validity does not prove feature support.

**Done when:** truthful coverage/provider, no private-address leakage or invented premises, consistent references, and validation of supported shipping data.

### L-04 — Business Profile eligibility/setup · Owner, conditional

Confirm eligibility first: shipping locally does not automatically make an online-only brand eligible. Establish qualifying in-person customer contact. Choose the appropriate storefront/service-area/hybrid setup, protect non-public addresses, and use actual available/applicable categories. Retail delivery alone does not justify a courier category. [Eligibility](https://support.google.com/business/answer/13763036?hl=en), [representation](https://support.google.com/business/answer/3038177).

**Done when:** owner-confirmed eligibility/profile facts and verification state recorded without a promised date. Profile verification does not block ordinary website SEO.

### L-05 / G-01 — Consistent identity · Owner + implementation

Use confirmed real-world brand, legitimate contacts, public-location policy, and accurate description across owned surfaces. sameAs should reference actual identity profiles. Resolve material contradictions without demanding identical prose/address formatting.

**Done when:** reviewed owned-profile inventory agrees with website entity information. AI descriptions are monitored observations, not acceptance criteria.

### L-06 — Authentic reviews · After real orders

Request reviews after actual delivery/experience. Avoid fabrication, incentives, and selectively soliciting positive reviews. Product and Business Profile reviews have separate purposes. Confirm communication preferences, timing, idempotency, and ownership before building a trigger. No arbitrary review-velocity threshold or two-hour implementation estimate.

**Done when:** a controlled status-transition test creates at most one appropriate request and respects the chosen communication policy. This review sends no messages to customers.

### G-02 / G-03 — Relevant mentions and factual copy · Ongoing

Pursue relevant editorial coverage, supplier/partner references, and genuine community participation. Do not buy ranking links, manufacture endorsements, or conceal promotional relationships. Evaluate relevance and qualified visits instead of promising one mention outweighs all on-site work.

Keep product contents, delivery conditions, restrictions, and policies understandable/current. Specificity helps only when accurate. AI citations and first-page rankings cannot be guaranteed or scheduled.

## 7. Work order and acceptance

| Stage | Work | Exit evidence |
|---|---|---|
| A — Protect setup | V-00; exact route inventory and owner facts | Deployed exclusion of unfinished catalog; no unfinished discovery submissions |
| B — Truth and foundation | V-01/02/19/21/23; V-03 reliability; V-05 accuracy; V-18; L-01; begin V-15 ownership | Correct URLs/metadata, sitemap logic, commerce consistency, known locale readiness |
| C — Ready inventory | V-04/06/09/12/13; V-14 baseline; V-20 alongside changes; V-22 if capacity needs it | Agreed inventory passes technical/content/commerce checks |
| D — Intentional launch | Enable ready indexing; sitemap submission; analytics/feed checks | Noindex removed only where intended; inspection/diagnostic evidence |
| E — Evidence-led expansion | V-07/08/10/11, further content, conditional local work, optimization | Documented customer/search need and measured improvements |

### Launch checklist

- [ ] Owner confirms ready products/pages, identity, policies, delivery rules, and locale scope.
- [ ] Pre-launch exclusion and explicit launch removal are tested on production responses.
- [ ] Preview/private/utility controls remain effective in both locales.
- [ ] HTTPS/www canonicals and protocol/host/slash redirects checked for loops/chains.
- [ ] Ready pages have relevant localized metadata without duplicated branding.
- [ ] Canonicals, sitemap, internal links, and eligible reciprocal alternatives agree.
- [ ] Pagination/filter/search/variant URLs follow their explicit policies.
- [ ] Sitemap contains complete eligible inventory, honest dates, no hidden/unready URLs.
- [ ] Missing content and data outages differ; failed refreshes cannot persist empty catalogs.
- [ ] Every ready product is reachable through links; disabled gift cards remain excluded.
- [ ] Product/variant price, stock, reviews, and delivery promises match actual purchase behavior.
- [ ] JSON-LD safely serialized; supported feature tests have no required-property errors.
- [ ] Real support/returns/privacy/terms content published; indexed French reviewed.
- [ ] Essential content works without hydration; performance baseline/limitations recorded.
- [ ] Search Console/Bing ownership/submission states recorded, not assumed.
- [ ] Chosen analytics/consent and deduplicated conversion events tested.
- [ ] Merchant submissions follow purchase/policy readiness and landing-page agreement.
- [ ] Change log records launch switch, affected URLs, checks, date, and responsible person.

### Measurement after launch

Review weekly initially, separating branded/non-branded queries, page types, locales, regions, and devices where data permits. Track organic clicks/impressions, landing-page conversions/revenue, qualified corporate inquiries, priority-page indexing, Merchant diagnostics, and field performance. Establish targets after a baseline and commercial priorities exist.

Investigate individual URLs: responses, noindex, selected canonical, content completeness, links, sitemap, rendering, and console reports. Do not assume crawl budget or deployment frequency explains delays. Prioritize customer impact and affected ready inventory.

AI referrals/citations can be sampled with date/prompt/locale, but are variable/incomplete. A chatbot response is not a ranking report. No fixed promises are made for verification, indexing, map-pack placement, national rankings, or AI citations.

## 8. Review status and next dependency

This revision replaces unsupported requirements with verified findings, conditional recommendations, and acceptance checks, and records the owner's pre-launch exclusion decision.

**Next implementation task (2026-09-21):** owner sets `SITE_INDEXING` in Vercel (`home` or `all`) once section 3 answers are in; then GSC/Bing verification tokens, GA4/consent decision, Merchant feed and LocalBusiness markup. Business-specific copy, physical-location schema, delivery pages, shipping/return markup, and French indexing depend on section 3 answers. This review has not changed production indexing, application behavior, external account settings, or customer communications.
