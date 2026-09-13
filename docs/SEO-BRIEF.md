# Velvéa — SEO / AEO / GEO build brief

**For:** the agent working in `D:\Grow\Velvea\velvea`
**Written from:** a read of that repo on 2026-09-12, plus the patterns already shipped in the
GrowMint repo (`D:\Grow\Grow`), which is the reference implementation for everything below.

Velvéa is a transactional gift-basket store (Next 15.5.25, App Router, `src/` layout, next-intl
`en`/`fr` with `localePrefix: "as-needed"`, Prisma/Postgres, Stripe, Cloudinary). GrowMint is a
content/lead-gen site. The *tactics* transfer; the *page types* do not. Where they diverge this
brief says so rather than telling you to copy a file that solves a problem Velvéa does not have.

Read this whole file before touching code. Then work the tickets in section 4 in order — they are
ordered so that each one makes the next one cheaper, and doing 4 before 1 means writing the same
URL string in nine files.

### What is verified here, and what is not

**Verified by reading the repository** at the date above: every finding in section 2, every file
path, the delivery-area arrays and their drift, the `force-dynamic` count, the missing-description
count, the absence of pagination, `localeDetection`, the message-file parity, and the query-level
status filters. Where a count appears below, it was counted, not estimated.

**Not verified, and you must check before relying on it:**
- **Nothing was measured against a live site.** No Search Console, no analytics, no crawl, no
  Lighthouse run, no live URL. Velvéa may not be deployed yet. Every performance and indexing claim
  here is inferred from the code and from what the same stack did on GrowMint.
- **No competitor analysis and no keyword research.** The query examples throughout ("birthday gift
  baskets Canada", "same day gift delivery brampton") are informed guesses about intent, not volume
  data. Validate them in Search Console or a keyword tool before committing the content budget in
  V-12 and L-02.
- **The catalogue size is unknown.** Whether pagination (V-22) is urgent or theoretical depends on
  how many products a collection actually holds.
- **Business facts are unconfirmed**: whether the Mississauga atelier takes walk-ins (decides the
  Business Profile type in L-04), whether a written returns policy exists (gates V-05 and V-16),
  and the real NAP (F8).

Treat this as a build brief, not an audit. The first thing to do after phase 1 is get Search
Console open so the next revision of this document can be written against data.

---

## 0. The three acronyms, stated plainly

They are not three programmes. They are three consumers of the same page, and the work overlaps
heavily. Knowing which consumer a change is for stops you from over-building.

| | Consumer | What it rewards | What it ignores |
|---|---|---|---|
| **SEO** | Googlebot / Bingbot → the blue links | Crawlability, unique indexable pages, internal links, Core Web Vitals, correct structured data, external links | Clever prose nobody links to |
| **AEO** *(Answer Engine Optimisation)* | AI Overviews, featured snippets, Bing Copilot | A direct, self-contained answer sentence near the question; FAQ/HowTo/Product schema; facts stated as facts ("$150", "before 4 PM", "48 hours") | Brand adjectives, "curated elegance" |
| **GEO** *(Generative Engine Optimisation)* | ChatGPT Search, Perplexity, Claude, Gemini | Being *named* on third-party sources the model already trusts; a clean entity (one name, one address, one set of profiles); full text in the first HTML response; `llms.txt` | On-page keyword density |

The single most useful thing to internalise: **GEO is mostly off-site.** A model cites Velvéa
because a gift guide on a Canadian lifestyle site listed it, not because Velvéa's own copy was
persuasive. Everything in section 4 makes Velvéa *citable*; section 5 is what makes it *cited*, and
section 5 is Tom's work, not yours. Do not spend a week polishing schema and report it as a GEO
programme.

Second thing: **ChatGPT Search reads Bing's index.** Velvéa is not in Bing Webmaster Tools at all
today. That is a GEO blocker sitting in a webmaster console, not in the code.

Third: **Local is its own discipline, not a subset of SEO.** Velvéa runs a real same-day delivery
operation across 17 named GTA municipalities with its own fee schedule and cutoff. That earns a
local programme — section 4b — rather than a footnote.

### Where each discipline lives in this file

| Discipline | Tickets | The core move |
|---|---|---|
| **Technical SEO** | V-01 → V-03, V-19, V-20, V-22, V-23 | Canonicals, prerendering, pagination, no duplicate URL space, CI guardrails |
| **Structured data** | V-04 → V-06, V-09 | One entity graph, merchant-grade `Product`, breadcrumbs, `ItemList` |
| **AEO** | V-07, V-12, plus L-02 | Answer-first sentences with the number in them, `FAQPage` on collections *and* city pages |
| **GEO** | V-11, V-15, G-01 → G-03, §5 | `llms.txt`, Bing, AI crawlers unblocked, entity consistency, third-party presence |
| **Local SEO** | **L-01 → L-07** | Business Profile, city delivery pages, `areaServed`, citations, local reviews |
| **Content** | V-08, V-12, V-13, V-18, **V-21** | Depth, meta descriptions, internal link graph, honest French |
| **Commerce** | V-05, V-16 | Merchant listings and the product feed |
| **Performance** | V-14 | LCP, and the Framer Motion trap |

---

## 1. What Velvéa already has (verified, do not rebuild)

- App Router, server components throughout. No client-side-only content — crawlers get real text.
- `src/app/robots.ts` — sensible disallow list (`/admin`, `/api/`, `/checkout`, `/account`,
  `/order/`, `/search`), sitemap pointer.
- `src/app/sitemap.ts` — genuinely good. Static routes, collections from `src/lib/nav.ts`, products
  and articles from Prisma, real `lastModified` from `updatedAt`, and `alternates.languages` for
  en/fr per entry. This is ahead of most stores.
- `generateMetadata` on 27 route files — **titles** exist almost everywhere. Descriptions do not;
  see F10.
- **Image `alt` handling is already correct** and does not need work: `ProductCard` uses the product
  name, the PDP hero uses `img.alt || product.name`, and decorative thumbnails and hover images
  correctly pass `alt=""`. Do not "fix" these.
- `getAllProducts` filters on `status: "ACTIVE"`, so the sitemap cannot leak draft products as soft
  404s. Keep that filter if you refactor the query.
- Root `metadata` in `src/app/layout.tsx`: `metadataBase`, title template `%s · Velvea`,
  description, `openGraph`.
- One piece of structured data: `Product` on `src/app/[locale]/products/[slug]/page.tsx`, with
  `aggregateRating` gated on `reviewCount > 0` — the gate is correct and worth keeping.
- A data model that already carries what schema needs: `Product.sku`, `currency`, `inventory`,
  `avgRating`, `reviewCount`, `seoTitle`/`seoDescription`; `Article.author`, `publishedAt`,
  `coverImage`; a real `Review` model with a status enum.
- Visible breadcrumb UI on the PDP and in `Listing` (the markup for `BreadcrumbList` is free — the
  data is already assembled in the `breadcrumb` prop).
- `next.config.ts` sets `formats: ["image/avif", "image/webp"]`.

---

## 2. Findings, ranked by what they cost

### F1 — Every page is `force-dynamic`. All of them.
`export const dynamic = "force-dynamic"` appears on **19 public routes** including the PDP, all
collection pages, `/baskets`, `/guides` and `/guides/[slug]`. Nothing is prerendered, nothing is
cached, every crawler hit is a cold database round trip.

Three separate costs: TTFB on every crawl (Google's crawl budget is spent waiting), LCP on every
real visit, and database load. It also makes `generateStaticParams` pointless, so Google never gets
a fast static HTML response for the pages you most want indexed. This is the highest-cost finding
in the file and the cheapest to fix. → **V-03**

### F2 — No canonical URL on any page. None.
`grep -rn "canonical\|alternates" src/app` returns exactly one hit, in `sitemap.ts`. So:
- Every filtered/sorted collection URL (`?sort=price-asc`, `?max=150`, `?recipient=…`) is a
  separate indexable URL with no canonical pointing home. `/occasions/birthday` and
  `/occasions/birthday?sort=newest` are two pages to Google with identical products.
- `og:url` is inherited from the root layout on every page, so every share card claims to be the
  home page. This is the exact bug `lib/seo.ts` in the GrowMint repo exists to prevent — read the
  comment block at the top of that file, it explains the failure mode in detail.
- No `hreflang`. The sitemap declares en/fr alternates but the pages do not, and Google weights the
  on-page annotation. The `/fr` tree is currently at risk of being read as duplicate content.
→ **V-02**

### F3 — One schema type on the whole site.
Missing, in rough order of value for a store like this:
`Organization` + `WebSite` (the entity itself — this is the GEO foundation), `LocalBusiness`
(same-day GTA delivery is a local-intent product), `BreadcrumbList` (visible breadcrumbs already
exist, so this is free), `ItemList` on collection pages, `FAQPage`, `Article` on guides, `Review`.
And the existing `Product` node is missing `sku`, `url`, `@id`, `itemCondition`,
`priceValidUntil`, `shippingDetails` and `hasMerchantReturnPolicy` — the last two are what Google
requires for merchant listing rich results, which is the one rich result that puts a price and a
star rating directly in the SERP for a product query. → **V-04 … V-09**

### F4 — No Open Graph image worth sharing, no Twitter card.
Root `openGraph.images` points at `/brand/velvea-logo.png?v=3` — a logo file, not a 1200×630 card.
No `opengraph-image.tsx` anywhere, no `twitter` block in metadata. Product pages pass the raw
Cloudinary product image, which is at least a real picture but is un-sized and un-cropped. Gift
purchasing is heavily shared (someone sends a basket link to a partner) — this is a conversion
finding as much as an SEO one. → **V-10**

### F5 — No `llms.txt`, no RSS.
`llms.txt` is the single cheapest GEO artefact: a plain-text map of the site written for a model
rather than a crawler. GrowMint's is at `app/llms.txt/route.ts` and is generated from the same
content modules the pages use, so it cannot drift. → **V-11**

### F6 — No analytics, no Search Console, no Bing, no IndexNow.
`grep` for `gtag|googletagmanager|plausible|verification` across `src/` returns nothing. There is
no measurement of any of this work, and no way to tell whether a page is indexed. Bing's absence is
specifically a ChatGPT-visibility blocker. → **V-15**

### F7 — Collection pages are thin.
`/occasions/[slug]` renders a title, a one-sentence fallback description and a product grid. That
is the page expected to rank for "birthday gift baskets Canada", against competitors running
800–1500 words plus an FAQ. Same for `/recipients/[slug]` and `/category/[slug]`. The generated
fallback sentence ("Thoughtful gift baskets for birthday, composed by hand and delivered across
Canada") is also near-identical across every slug, which is a duplicate-content pattern at scale.
→ **V-12**

### F8 — Placeholder NAP in `src/lib/settings.ts`.
`phone: "+1 (905) 555-0142"` is a reserved fictional number, and `1 Mississauga Valley Blvd` is a
municipal address, not a business one. **Do not emit `LocalBusiness` schema with these values.**
Publishing a fake NAP is worse than publishing none: it poisons the entity across every aggregator
that scrapes it, and it is the hardest kind of mistake to un-publish. V-04 is written so the
`LocalBusiness` node is gated on real values being present. Flag this to Tom as a blocker, then
carry on with everything else.

### F9 — A real same-day delivery business with no local surface at all.
Velvéa runs `LOCAL_SAMEDAY` ($15) and `LOCAL_STANDARD` ($9) delivery to **17 named GTA
municipalities** with a 4 PM ET cutoff, and packs the baskets in Mississauga. None of that is
visible to a search engine as a local offering: no Business Profile, no delivery-area page, no
`areaServed`, no city landing pages, and the cutoff and fees exist only inside checkout.
"Mississauga" appears in the copy as brand flavour ("our Mississauga atelier") rather than as a
served area, and **"Brampton" appears nowhere outside a hardcoded array in `pricing.ts`** — despite
being the second-largest city Velvéa delivers to same-day.

That array is also duplicated in `src/lib/settings-client.ts` and the two copies have already
drifted (`"north york"` is listed twice in one, once in the other). → **section 4b, L-01 … L-07**

### F10 — 25 of 27 pages have no meta description.
Only `/products/[slug]` and `/guides/[slug]` set one. Everything else — the home page's own locale
route, `/baskets`, every occasion, recipient and category page, `/about`, `/corporate`, `/faq`,
`/shipping`, `/contact`, `/custom`, `/gift-cards`, `/reviews`, `/guides` — returns a title and
nothing more, so Google writes the snippet itself from whatever text it finds first.

Most of those pages are the commercial ones. This is the highest effort-to-value ratio item in the
entire brief: roughly a day of writing, no architecture, and it affects click-through on every
result the site earns. → **V-21**

### F11 — No pagination. Collections are hard-capped at 48 products.
`getProductsByCollection(..., { take: 48 })` with no `skip`, no page param, and no "load more"
control anywhere in `Listing`. Product 49 in any collection is reachable only through the sitemap
or search. As the catalogue grows this silently strands inventory — from both crawlers and
customers. → **V-22**

### F12 — Locale detection redirects are on by default.
`src/i18n/routing.ts` does not set `localeDetection`, so next-intl's default (`true`) applies and
the middleware will redirect `/` based on the visitor's `Accept-Language` header and a stored
cookie. Two consequences: a crawler or an AI fetcher sending a French header can be bounced to
`/fr` for a URL you declared canonical as English, and cookie-influenced redirects make hreflang
validation unreliable. → **V-23**

---

## 3. What to copy from the GrowMint repo, and what not to

Read these files before writing the equivalent. The *comments* are the point — they record why each
shape was chosen and what broke when it was done the other way.

| GrowMint file | Read it for | Transfers to Velvéa? |
|---|---|---|
| `lib/seo.ts` | The canonical + `og:url` single-source helper, and the three-point comment on how Next's `openGraph` replacement (not merge) semantics bite you | **Yes, directly.** Needs an hreflang extension — Velvéa is bilingual and GrowMint is not |
| `lib/structured-data.ts` | `@id` discipline (`#organization`, `#website`, `#webpage`), `sameAs`, `knowsAbout`, `alternateName`, one entity declared once and referenced by pointer everywhere else | **Yes, the technique.** Not the node list — swap `Service`/`ProfessionalService` for `Store`/`Product`/`ItemList`/`OfferCatalog` |
| `app/sitemap.ts` | The `lastmod` honesty argument, and why `noindex` pages must never be submitted | Partly — Velvéa's sitemap is already good. Take the rule: never list a URL the page itself `noindex`es |
| `app/llms.txt/route.ts` | Structure and tone of an `llms.txt` generated from live content, `dynamic = "force-static"` | **Yes**, with commerce sections instead of services |
| `components/json-ld.tsx` | Four lines. Just take it | Yes |
| `scripts/indexnow.mjs` | Bing/IndexNow submission wired as `postbuild`, production-gated, never fails a build | Yes |
| `LOCAL-SEO.md` | The full Google Business Profile playbook — categories, service areas, the review flow | Yes, as Tom's reference |
| `VISIBILITY-AUDIT.md` §3c | What a real Search Console reading looks like, and why "Discovered, currently not indexed" happens (crawl budget spent on renamed JS chunks after frequent deploys) | Read it. Velvéa will hit the same wall |
| `lib/evidence.ts` | Build-time assertions on claims, so a wrong number stops the build instead of reaching a visitor | The technique, for review/rating data |

**Copy the *shape* of `locations/[slug]`, not the volume.** GrowMint has five city pages, not
forty, and `LOCAL-SEO.md` explains the rule: a city earns a page by having something specific to
say, and five near-duplicate pages with the place name swapped are doorway pages that Google
demotes. Velvéa passes that test for a handful of cities and fails it for the rest — see L-02 for
which, and why.

**Do not copy** `services/[slug]/[city]`. That is a service × city matrix; Velvéa's equivalent
would be occasion × city (`birthday gift baskets Brampton` × 17 municipalities), which is the
doorway pattern in its purest form and is explicitly warned against in `LOCAL-SEO.md`. Velvéa's
scaling axis is occasion × recipient × category, which already exists.

---

## 4. Tickets

Each ticket: **Why** (the cost), **What** (the change), **Done when** (a check you can actually
run). Do them in the order given in section 8.

---

### V-01 — One config module, one URL string
**Why.** `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"` is copy-pasted
in `robots.ts`, `sitemap.ts` and `layout.tsx`, and every ticket below needs it again. The localhost
fallback is also a live hazard: if the env var is missing in a Vercel production build, you ship a
sitemap and canonical set full of `http://localhost:3000` URLs.

**What.** `src/lib/site.ts` exporting a frozen `site` object: `url`, `name` (`"Velvéa"`),
`legalName`, `alternateNames` (`["Velvea", "Velvéa"]` — the accent *will* be dropped by people
typing and by some aggregators; declare both), `description`, `locales`, `defaultLocale`,
`currency: "CAD"`, plus `contact`/`social` re-exported from `DEFAULT_SETTINGS`. Throw at module
load if `NEXT_PUBLIC_SITE_URL` is unset **and** `process.env.VERCEL_ENV === "production"`; fall back
to localhost otherwise. Replace the three inline copies.

**Done when.** `grep -rn "localhost:3000" src/` returns only `src/lib/site.ts`.

---

### V-02 — `canonical()` helper: canonical + `og:url` + hreflang, from one path
**Why.** F2. Three tags that must agree, currently written in zero places.

**What.** `src/lib/seo.ts`, modelled on GrowMint's but bilingual:

```ts
import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * Canonical, og:url and hreflang for one page, derived from one locale-less path.
 *
 * Next replaces `openGraph` and `alternates` wholesale when a segment declares
 * one — there is no deep merge — so anything the root layout sets and a page
 * omits is dropped. That is why `type` and `siteName` are repeated here, and why
 * a page that writes its own `alternates` must use this helper rather than
 * hand-rolling it.
 *
 * `title` and `description` are deliberately absent from `openGraph`: leaving
 * them unset lets Next fill them from the page's own values after the title
 * template runs, so each card gets that page's real title.
 */
export function canonical(
  path: string,                      // locale-less, leading slash, no query: "/occasions/birthday"
  locale: string,
  opts: { ownCard?: boolean } = {},
): Pick<Metadata, "alternates" | "openGraph"> {
  const clean = path === "/" ? "" : path;
  const en = `${site.url}${clean || "/"}`;
  const fr = `${site.url}/fr${clean}`;
  return {
    alternates: {
      canonical: locale === "fr" ? fr : en,
      languages: { en, fr, "x-default": en },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: locale === "fr" ? fr : en,
      ...(!opts.ownCard && { images: [{ url: "/opengraph-image", width: 1200, height: 630 }] }),
    },
  };
}
```

Then spread `...canonical(`/occasions/${slug}`, locale)` into the return of **every**
`generateMetadata` in `src/app/[locale]/`. All 26 of them.

Two rules that come with it:
- **Query parameters never appear in a canonical.** `/occasions/birthday?sort=price-asc` must
  canonicalise to `/occasions/birthday`. Since the helper takes a path and the page passes its own
  slug, this is automatic — just never pass `searchParams` into it.
- **`/search`, `/checkout`, `/account`, `/order/[n]` get `robots: { index: false, follow: true }`**
  in their metadata, not just a robots.txt disallow. A disallowed page can still be indexed from an
  external link; only the meta tag reliably keeps it out.

**Done when.** `curl -s https://…/fr/occasions/birthday | grep -E 'rel="canonical"|hreflang|og:url'`
shows a `/fr/` canonical, three `hreflang` links, and an `og:url` matching the canonical.

---

### V-03 — Delete `force-dynamic`; prerender and revalidate
**Why.** F1. Biggest win in the file.

**What.** Remove `export const dynamic = "force-dynamic"` from every **public** route in
`src/app/[locale]/`. Keep it on `/account`, `/checkout`, `/order/[orderNumber]` and everything under
`src/app/admin` — those are per-user and must never be cached.

Replace with:
- `export const revalidate = 3600` on collection pages, `/baskets`, `/guides`, `/reviews` and the
  marketing statics (`/about`, `/faq`, `/shipping`, `/contact`, `/custom`, `/corporate`,
  `/gift-cards`).
- `export const revalidate = 900` on `/products/[slug]` (price and stock change more often).
- `generateStaticParams` on `/products/[slug]`, `/occasions/[slug]`, `/recipients/[slug]`,
  `/category/[slug]`, `/guides/[slug]`, returning the published slugs from Prisma for **both**
  locales. Leave `dynamicParams` at its default `true` so a product added after the build still
  renders.
- **On-demand invalidation** is the piece that makes the cache honest: call `revalidatePath` (or a
  tag) from the admin server actions in `src/lib/actions/` that publish or edit a product, a
  collection or an article. Without this, an admin edit takes up to an hour to appear and someone
  will "fix" it by putting `force-dynamic` back.

Sorting/filtering currently reads `searchParams`, which opts a page into dynamic rendering anyway.
Two acceptable outcomes: move filtering to a client component over a prerendered product list (best
— the page is static and filtering is instant), or accept dynamic rendering *for the filtered
variant only* while the bare URL stays static. Either way the bare `/occasions/birthday` must be in
the prerender manifest.

**Done when.** `npm run build` prints `●` (SSG) or `ISR` next to the PDP and all collection routes,
not `ƒ` (Dynamic). Record the static route count in the README the way GrowMint does.

---

### V-04 — The entity graph: `Organization`, `WebSite`, and (gated) `LocalBusiness`
**Why.** This is the GEO foundation. A model answering "where can I order a gift basket in
Mississauga" needs to resolve "Velvéa" to one business with one address, one phone number and a set
of profiles it can cross-check. Today there is nothing on the site making that assertion.

**What.** `src/lib/structured-data.ts` + `src/components/JsonLd.tsx` (copy GrowMint's four-liner).

```
Organization  @id `${site.url}/#organization`
  name, alternateName: ["Velvea", "Velvéa"], url, logo (square PNG, ≥112px, NOT the OG card),
  image, description, email, telephone, address (PostalAddress),
  sameAs: [instagram, facebook, pinterest, tiktok],   // from DEFAULT_SETTINGS.social
  areaServed: { "@type": "Country", name: "Canada" },
  knowsAbout: ["Gift baskets", "Corporate gifting", "Same-day gift delivery", …]

WebSite       @id `${site.url}/#website`
  name, alternateName, url, inLanguage: ["en-CA","fr-CA"],
  publisher: { "@id": "…#organization" },
  potentialAction: SearchAction → `${site.url}/search?q={search_term_string}`

Store         @id `${site.url}/#store`        ← LocalBusiness subtype. GATED. See below.
  name, image, telephone, address, geo, openingHoursSpecification (from settings.contact.hours),
  priceRange, currenciesAccepted: "CAD", paymentAccepted,
  areaServed: [Mississauga, Toronto, …GTA],  parentOrganization: { "@id": "…#organization" }
```

Emit `Organization` + `WebSite` once, in `src/app/[locale]/layout.tsx`. They belong to the site, not
to a page.

**The gate.** Wrap the `Store` node in a check that `settings.contact.phone` does not match
`/555-01\d\d/` and that the street address is set to something other than the current placeholder.
Log a build-time warning when it is skipped. See F8 — this is deliberate, not laziness.

**Also:** `WebPage`/`AboutPage` nodes on `/` and `/about` only, following the reasoning in the
comment above `webPageSchema` in GrowMint's `lib/structured-data.ts`: pages that already carry a
primary entity (a `Product`, an `Article`) do not need one.

**Done when.** The home page passes Google's Rich Results Test with `Organization` and `WebSite`
detected and zero errors, and every `@id` reference resolves to a node that exists.

---

### V-05 — `Product` schema to merchant-listing grade
**Why.** Merchant listing rich results put price, availability and stars in the SERP. They are the
highest-CTR result a product page can earn, and Google requires specific fields before it will show
them. The current node has about half.

**What.** Rewrite the inline object in `src/app/[locale]/products/[slug]/page.tsx` as
`productSchema(product, locale)` in `src/lib/structured-data.ts`:

```ts
{
  "@type": "Product",
  "@id": `${site.url}/products/${slug}#product`,
  name, description, image: [...],          // absolute URLs
  sku: product.sku ?? undefined,
  brand: { "@type": "Brand", name: "Velvéa" },
  url: canonicalUrl,
  inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
  offers: {
    "@type": "Offer",
    url: canonicalUrl,
    priceCurrency: product.currency,        // already "CAD" on the model
    price: (priceCents / 100).toFixed(2),
    priceValidUntil: <today + 1 year, ISO date>,
    itemCondition: "https://schema.org/NewCondition",
    availability: product.inventory === null || product.inventory > 0
      ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    seller: { "@id": `${site.url}/#organization` },
    shippingDetails: { "@type": "OfferShippingDetails", … },     // ← required for merchant listings
    hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", … },
  },
  ...(reviewCount > 0 && { aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: avgRating.toFixed(1), reviewCount, bestRating: 5, worstRating: 1,
  }}),
  ...(reviews.length > 0 && { review: reviews.slice(0, 5).map(reviewNode) }),
}
```

Build `shippingDetails` and `hasMerchantReturnPolicy` from `DEFAULT_SETTINGS.delivery` — the free
threshold (`freeShippingThresholdCents`), the standard/express rates, and a `deliveryTime` derived
from `product.leadTimeDays` plus transit. **Only state a return policy that Tom actually operates.**
If there is no written policy yet, omit the field and raise it — a fabricated 30-day return window
in schema is a legal exposure, not an SEO tactic.

Where a product has variants at different prices, `offers` becomes an `AggregateOffer` with
`lowPrice`/`highPrice`/`offerCount`. Prefer that over a `ProductGroup`/`hasVariant` split — Velvéa's
variants are size tiers, not distinct SKUs.

**Keep the existing `reviewCount > 0` gate.** `aggregateRating` on a product with no reviews is a
manual-action risk.

**Done when.** Rich Results Test reports "Merchant listing" eligible with no errors on a product
that has reviews, and no `aggregateRating` warnings on one that does not.

---

### V-06 — `BreadcrumbList` everywhere, `ItemList` on collections
**Why.** Breadcrumbs replace the ugly URL in the SERP and are the cheapest structured data on the
site — the visible breadcrumb components on the PDP and in `Listing` already hold the exact data.
`ItemList` tells Google a collection page is a product list rather than an article, which is what
makes it eligible for the carousel treatment.

**What.**
- `breadcrumbSchema(items)` — copy GrowMint's verbatim, it is ten lines. Feed it the same array the
  `Listing` component already receives as `breadcrumb`, and the hardcoded trail on the PDP.
- `itemListSchema(products, listUrl)` on `/baskets`, `/occasions/[slug]`, `/recipients/[slug]`,
  `/category/[slug]`: `ItemList` → `ListItem` with `position` and `url` (URL-only form; do not
  inline whole `Product` nodes into a list, it bloats the page and Google prefers the pointer).
- Cap at the products actually rendered on the first page. Do not list products the visitor cannot
  see.

**Done when.** A collection page shows `BreadcrumbList` + `ItemList`, and the PDP shows
`BreadcrumbList` + `Product`, all valid.

---

### V-07 — `FAQPage`, and put the FAQ where it earns its keep
**Why.** AEO's most direct lever. The Q&A content already exists in `messages/en.json` →
`faq.items` (and the `fr` equivalent) and renders through `src/components/home/Faq.tsx`.

**What.**
1. `faqPageSchema(items)` on `/faq` — GrowMint's version works unchanged.
2. **Answer text must match the visible answer exactly.** Do not write schema-only answers.
3. Extend beyond the current six. The questions worth adding are the ones people actually type and
   that models get asked: *"How late can I order for same-day delivery in Mississauga?"*,
   *"Do you deliver to Quebec / the territories?"*, *"Can I send a gift basket to a hospital?"*,
   *"What is the corporate minimum order?"*, *"Are prices shown to the recipient?"* (the existing
   copy already answers this one — surface it), *"Is everything halal / kosher / nut-free?"*.
4. Add **three to five occasion-specific questions to each collection page** and mark them up
   there. This is the single most effective AEO change available: a page that answers
   "how much should I spend on a corporate gift in Canada" in one direct sentence is a page an
   answer engine can lift.
5. **Answer-first writing rule** for all of the above: the first sentence is the complete answer
   with the number in it. "Order by 4 PM ET for same-day delivery in Mississauga and the GTA."
   Then the nuance. Never "We're delighted to offer a range of delivery options…".

**Done when.** `/faq` validates as `FAQPage`; at least three collection pages carry their own
`FAQPage` node with unique questions.

---

### V-08 — Guides: `Article` schema, real authors, RSS
**Why.** `/guides` is the only non-transactional content on the site and therefore the only thing
that can earn a link. It currently ships with no schema and no feed.

**What.**
- `articleSchema(article, locale)` on `/guides/[slug]`: `@type: "Article"` (or `"BlogPosting"`),
  `headline` (≤110 chars), `description`, `image` from `coverImage`, `datePublished`,
  `dateModified` (fall back to `datePublished` rather than asserting an edit that never happened),
  `author` as a **`Person` with a stable `@id`** — `Article.author` is a nullable string today, so
  populate it and reference the same `@id` across articles — `publisher: { "@id": "…#organization" }`,
  `inLanguage`, `mainEntityOfPage`.
- If a guide has no named human author, that is a content problem, not a schema problem. Google's
  guidance and every answer engine weight named authorship. Ask Tom for a byline.
- `src/app/guides/rss.xml/route.ts` (or under `[locale]`) with `force-static`, plus the feed
  `alternate` link in the `/guides` metadata. Feeds are how aggregators and several AI crawlers
  discover new content cheaply.
- Guides need **images with alt text**. GrowMint's audit finding 06 was "thirteen thousand words
  with zero images" — check `Article.coverImage` coverage before repeating it here.

**Done when.** A guide validates as `Article`, the feed returns valid RSS 2.0, and `/guides` links
it via `alternates.types`.

---

### V-09 — Reviews: render them, mark them up, keep them honest
**Why.** `Review`, `avgRating` and `reviewCount` are on the model and a `/reviews` page exists.
Stars in the SERP move CTR more than any title rewrite.

**What.**
- `Review` nodes nested in the product's `review` array (V-05), each with `author` (`Person`,
  first name + initial is fine), `datePublished`, `reviewRating` with `bestRating: 5`, and
  `reviewBody`. **Only `APPROVED` reviews** (check the `ReviewStatus` enum).
- The `/reviews` page gets an `ItemList` of `Review` nodes, not an `AggregateRating` for the whole
  site — site-wide aggregate ratings are not a supported rich result and read as manipulation.
- **A build-time assertion**, in the spirit of `lib/evidence.ts`: fail the build if `avgRating > 0`
  while `reviewCount === 0`, if `avgRating > 5`, or if a rendered review's rating falls outside
  1–5. A wrong star rating in schema is a manual action; catching it in CI costs twenty lines.
- Every review shown in schema must be visible on the page it is marked up on. This is the rule
  Google enforces most aggressively.

**Done when.** A product with approved reviews shows stars in Rich Results Test; the assertion
fails a deliberately corrupted seed.

---

### V-10 — Generated OG cards + Twitter cards
**Why.** F4. Gift links get shared person-to-person; this is the one SEO ticket with a direct
conversion argument.

**What.**
- `src/app/opengraph-image.tsx` — site-wide card via `next/og` `ImageResponse`, 1200×630, brand
  colours and the wordmark, with `size` and `alt` exported alongside.
- `src/app/[locale]/products/[slug]/opengraph-image.tsx` — per-product card: the Cloudinary hero,
  the product name, the price. Pass `ownCard: true` to `canonical()` on that route so the helper
  does not override the file-convention image (this is exactly the trap GrowMint's `lib/seo.ts`
  comment point 3 describes — a page that declares `openGraph` at all stops inheriting the
  generated card, so the file convention only wins when the page leaves `images` unset).
- `twitter: { card: "summary_large_image" }` in the root metadata. Next derives the image from
  `openGraph` — no second image needed.
- Cloudinary can do the product crop as a URL transform (`c_fill,w_1200,h_630`), which is cheaper
  than rendering one per request. Either approach is fine; pick one and be consistent.

**Done when.** An OG debugger renders a correct card for `/`, a product, and a guide.

---

### V-11 — `llms.txt`
**Why.** F5. Cheapest GEO artefact on the list.

**What.** `src/app/llms.txt/route.ts`, `export const dynamic = "force-static"`, generated from
Prisma + `src/lib/nav.ts` so it cannot drift from the site. Read GrowMint's
`app/llms.txt/route.ts` first — the shape is right, the content is not.

Sections for Velvéa:
```
# Velvéa
> <one-sentence description>
<a paragraph of plain fact: what it sells, where it ships, price range, lead times,
 same-day cutoff, languages, corporate minimums, who it is. No adjectives a model
 cannot verify from the site.>

## Ordering & delivery     ← cutoffs, provinces, fees, free-shipping threshold, lead times
## Shop by occasion        ← every OCCASION + HOLIDAY slug, linked, one line each
## Shop by recipient       ← every RECIPIENT slug
## Categories              ← every CATEGORY slug
## Bestsellers             ← 10 products, name + price + URL
## Corporate gifting       ← /corporate, /corporate/quote, minimums, lead time
## Guides                  ← 10 most recent, title + description
## Company                 ← /about, /contact, /faq, /shipping, /reviews, NAP
```

Two rules: only claims the site itself makes in visible copy, and prices with the currency
attached (`$149 CAD`). A model quoting "$149" without a currency to a US reader is a returned order.

**Done when.** `curl https://…/llms.txt` returns `text/plain`, and the build output shows it
prerendered rather than dynamic.

---

### V-12 — Collection-page depth (the AEO/GEO content ticket)
**Why.** F7. This is where the traffic actually is, and it is the one ticket that is mostly writing
rather than code.

**What.** For each of the top ~10 collection slugs (pick by commercial value: corporate, birthday,
thank-you, sympathy, new-baby, Christmas, Mother's Day, housewarming, get-well, wedding):

1. A **250–400 word intro** above or beside the grid: what belongs in this kind of gift, what to
   spend, what to avoid, delivery timing for that occasion. Unique per slug — the current shared
   fallback sentence is the thing to replace.
2. A **"How to choose" block**: 3–5 short criteria. Marks up cleanly as `HowTo` if the steps are
   genuinely sequential; do not force it if they are not.
3. **3–5 FAQs** per V-07, marked up.
4. **Internal links out** to two or three related collections and one guide, in prose, not a chrome
   row.
5. A **price band stated in text** — "Most birthday baskets sit between $85 and $180." Answer
   engines lift ranges like this constantly, and it is a fact the site can back up.

Move the DB-fallback description into the `Collection.description` JSON field so it is editable in
the admin panel rather than generated in `page.tsx`. Content that lives in a template is content
nobody updates.

**Done when.** The ten pages average >700 words of unique body text (measure from the prerendered
HTML in `.next/server/app`, chrome stripped — GrowMint's audit describes the method), and no two
share an intro paragraph.

---

### V-13 — Internal linking
**Why.** Velvéa's deep pages (individual products, individual collections) are reachable mostly
through a mega-menu and a grid. Link equity concentrates in the header and never reaches the long
tail. GrowMint's finding 04 is the same problem and §3c has the fix pattern.

**What.**
- **Related products** on the PDP: today it is `getBestsellers(5)` — the same four products on every
  single product page. Make it collection-aware (same occasion, then same recipient, then price
  band). Identical related-rows sitewide are worth roughly nothing as internal links.
- **Cross-collection rows**: on `/occasions/birthday`, a row of recipients ("Birthday gifts for
  her / for him / for parents") linking the recipient collections, and vice versa. This is how the
  occasion × recipient matrix becomes a link graph instead of two flat lists.
- **Guides link to collections in prose**, and collections link to the one relevant guide.
- Port `scripts/link-graph.mjs` from GrowMint: it enforces a minimum inbound internal link count per
  page and fails when a page drops below it. Set the floor at 3 for collections and products.

**Done when.** `npm run link-graph` passes with a floor of 3, and no two PDPs show an identical
related set.

---

### V-14 — Core Web Vitals
**Why.** V-03 fixes TTFB. The rest is images and fonts — and on a gift-basket store, images are
the product.

**What.**
- `priority` on the LCP image only (the hero on `/`, the first product image on the PDP, the first
  grid tile on collections). `loading="lazy"` everywhere else. One `priority` per page.
- Explicit `sizes` on every `next/image` in a grid. Without it Next serves a full-width source for a
  300px tile.
- `ProductImage.width`/`height` exist on the model — populate them and pass them, so there is no
  layout shift while the image loads.
- Fonts: `next/font` with `display: "swap"` and preloaded subsets. Check `src/lib/fonts.ts`.
- **Framer Motion is the risk.** GrowMint's audit §3b found reveal animations shipping 70–82% of
  body text at `opacity: 0` until hydration, which put mobile Performance at 66 and made the LCP
  element a consent bar at five seconds. Check every `motion` usage in `src/components/` for the
  same shape: **content must render visible in the server HTML and animate from visible, or be
  below the fold.** Never gate above-the-fold text on hydration.
- Measure with local Lighthouse against a production build (`npm run build && npm start`), mobile
  preset. Record the numbers in the README as a table, per GrowMint's convention.

**Done when.** Mobile Performance ≥85 on `/`, a collection page and a PDP, with the LCP element
being the hero image on each.

---

### V-15 — Measurement and indexing (do this early, not last)
**Why.** F6. Everything above is unfalsifiable without it, and indexing lag is measured in weeks —
start the clock now.

**What (code).**
- GA4 via `@next/third-parties/google`, loaded after `load`. GrowMint's `lib/gtag.ts` and
  `lib/consent.ts` are the reference for both the loader and the gate.
- **There is no cookie-consent mechanism in Velvéa today** — `grep -rln "consent"` finds it only in
  the privacy page's prose. Velvéa sells into Quebec (the site is bilingual and `settings.ts`
  carries a QC tax rate), so Law 25 applies alongside PIPEDA, and analytics cookies need consent
  before they are set. **Build the consent gate in the same ticket as GA4, not after it.** Shipping
  tracking first and consent later is the ordering that creates the exposure.
  *Performance note from GrowMint's audit §3b: a consent bar mounted after hydration became the
  measured LCP element on every inner page. Render it in the server HTML with a CSS entrance.*
  *Known trap, from experience on GrowMint: GA4 will not render in local dev because the env var is
  empty there, and overriding it in a shell does not help. Verify in production.*
- Search Console verification via a DNS TXT record (survives redeploys, covers both hostnames) or
  `metadata.verification.google`.
- IndexNow: port `scripts/indexnow.mjs`, put the key file in `public/`, wire it as `postbuild` in
  `package.json`. Keep the production gate — it must no-op on preview builds and never fail a build.
- Confirm AI crawlers are not blocked. The current `robots.ts` `userAgent: "*"` allows them, which
  is the right default, but declare them explicitly so nobody "tightens" robots.txt later without
  understanding the cost: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`,
  `Google-Extended`, `Applebot-Extended`. **Allow all of them.** Blocking them is opting out of GEO.

**What (consoles — Tom, or you with access).**
- Google Search Console + Bing Webmaster Tools (import the property from GSC — it takes a minute).
  **Bing is not optional: ChatGPT Search reads Bing's index.**
- Submit `sitemap.xml` to both.
- Manual indexing requests, ~10/day for the first week, highest-value pages first.
- Expect the pattern GrowMint hit: a large "Discovered, currently not indexed" bucket, because
  Next renames every JS chunk on every deploy and frequent deploys spend the crawl budget
  re-downloading them. Batch deploys during the indexing window.

**Done when.** GA4 shows live traffic in production, both consoles are verified with the sitemap
read, and an IndexNow run returns HTTP 200/202.

---

### V-16 — Google Merchant Center feed
**Why.** Velvéa is a store. Free listings in the Shopping tab, and a product feed is a distribution
channel that structured data alone does not give you. Nothing on the site currently produces one.

**What.** `src/app/feeds/google-merchant.xml/route.ts` — RSS 2.0 with the `g:` namespace, one
`item` per published product: `g:id` (use `sku`, falling back to `slug`), `title`, `description`,
`link` (canonical), `g:image_link` + `g:additional_image_link`, `g:availability`, `g:price`
(`"149.00 CAD"`), `g:brand`, `g:condition`, `g:product_type` from the collection,
`g:google_product_category` (gift baskets sit under *Food, Beverages & Tobacco > Food Gift Baskets* —
confirm the current category ID against Google's published taxonomy), `g:shipping`. Separate feeds
per locale, or one feed with `g:language`.

Prerequisite: Merchant Center requires a visible returns policy and shipping terms on the site.
`/shipping` exists; check it actually states both. Same honesty constraint as V-05.

**Done when.** The feed validates in Merchant Center with zero disapprovals.

---

### V-17 — Local
Promoted to its own programme. **See section 4b**, tickets L-01 through L-07.

---

### V-18 — French is not a translation layer, it is half the index
**Why.** `localePrefix: "as-needed"` gives clean URLs, and the sitemap already declares alternates.
But every `Json` content field (`name`, `description`, `seoTitle`, `seoDescription`, `excerpt`,
`body`) can hold an empty `fr` value, and `tc()` will silently fall back to English. A `/fr/` page
serving English body text under a `fr-CA` `lang` attribute is a duplicate-content and quality signal
problem, not a cosmetic one.

**Scope this correctly before starting.** The UI strings are *not* the problem: `messages/en.json`
and `messages/fr.json` both carry 260 keys with none missing. The risk is entirely in the database
— the `Json` `{ en, fr }` columns on `Product`, `Collection` and `Article`, which no translation
file covers and no check enforces. Do not spend time auditing the messages files.

**What.**
- An audit query over the `Json` columns: count products, collections and articles with missing or
  empty `fr` values in any SEO-relevant field. Report it; do not machine-translate it silently.
- If a locale genuinely has no content for an entity, `noindex` that locale's page rather than
  serving the other language's text under it.
- `<html lang>` already comes from `getLocale()` — good. Make sure `inLanguage` in every schema node
  agrees with it (V-04/V-05/V-08 all take `locale` for this reason).
- `og:locale` and `og:locale:alternate` — handled by V-02's helper.

**Done when.** The audit reports zero indexed `/fr/` pages with English body content.

---

### V-19 — Guardrails against thin and duplicate URLs
**Why.** A store generates URL space faster than content. Left alone, Velvéa will end up with
thousands of near-duplicate filtered URLs competing with each other.

**What.**
- `/search` — `noindex, follow` in metadata (robots.txt disallow alone is not enough).
- Filtered/sorted collection URLs — canonical to the bare collection (V-02 handles this), and
  `noindex` any URL carrying a filter param.
- Pagination — self-canonical per page (not canonical-to-page-1), and a paginated URL enters the
  sitemap only if it carries distinct products.
- Empty collections — a collection with zero published products should `noindex` itself until it
  has stock. Take the rule from GrowMint's sitemap comments: **never submit a URL whose own page
  says `noindex`.** Apply it to `src/app/sitemap.ts`, which currently lists every slug in
  `src/lib/nav.ts` unconditionally, including ones with no products behind them.
- Out-of-stock products — keep the page, set `availability: OutOfStock`, show alternatives. Do not
  404 or redirect; that throws away the ranking.
- **Trailing-slash bug in the existing sitemap.** `entry()` builds the home URL as
  `` `${siteUrl}${path === "/" ? "" : path}` ``, which yields `https://www.velvea.ca` with **no
  trailing slash**, while V-02's helper produces `https://www.velvea.ca/` as the canonical. A
  sitemap URL that does not byte-match its page's canonical is a self-inflicted duplicate signal.
  Pick one form — the trailing slash — and make `entry()` and `canonical()` agree. Add it to
  `check-seo.mjs`.
- **Add images to the sitemap.** `MetadataRoute.Sitemap` entries accept an `images` array. For a
  store whose product *is* a photograph, Image search is a real channel and this is a two-line
  change in `sitemap.ts` — pass `p.images.map(i => i.url)` on each product entry.

**Done when.** Search Console's "Duplicate without user-selected canonical" bucket stays empty, and
the sitemap URL count matches the indexable page count.

---

### V-20 — Make the rules enforceable
**Why.** Everything above decays. GrowMint keeps `check-copy.mjs`, `check-dom.mjs` and
`link-graph.mjs` for exactly this reason.

**What.** `scripts/check-seo.mjs`, run in CI, reading the prerendered HTML from `.next/server/app`.
Fail the build on:
- a page with no canonical, or a canonical that disagrees with `og:url`
- a title over 60 chars or a description over 155 (GrowMint's audit found seven of these)
- a missing or duplicate `<h1>`
- an `<img>` in article or product content with no `alt`
- a sitemap URL whose page emits `noindex`
- invalid JSON in any `application/ld+json` block
- `aggregateRating` present with `reviewCount === 0`

Add `typecheck` and `lint` to the same CI step.

**Done when.** CI fails on a deliberately broken page and passes on `main`.

---

### V-21 — Write 25 meta descriptions
**Why.** F10. Cheapest win in the document, and it is not a technical ticket — it is a day of
copywriting. Do not let it slip behind the schema work because the schema work is more interesting.

**What.** A `description` in every `generateMetadata` under `src/app/[locale]/`, in **both
locales** — these belong in `messages/en.json` and `messages/fr.json` alongside the rest of the
copy, not hardcoded in `page.tsx`, or the French half will never be written.

Rules: 140–155 characters, the primary term in the first half, and a reason to click that the title
does not already give (a price band, the same-day cutoff, the free-shipping threshold). Collection
descriptions must be **unique per slug** — the `${title} gift baskets, delivered across Canada`
pattern applied to 30 slugs is the same duplicate-content problem as F7, moved into the SERP.

For collection pages, generate from `Collection.description` where the admin has written one and
fall back to a per-slug string, so editors can improve them without a deploy.

Skip `/checkout`, `/account`, `/order/*` and `/search` — they get `noindex` in V-02 instead.

**Done when.** `check-seo.mjs` (V-20) finds a 140–155 char description on every indexable page in
both locales, with no duplicates.

---

### V-22 — Pagination, or an honest reason not to have it
**Why.** F11. A 48-product ceiling per collection.

**What.** Either is defensible; pick one and be deliberate:
- **Real pagination** — `?page=2` with `skip`/`take`, `rel` self-canonical on each page (not
  canonical-to-page-1), every page in the sitemap, and crawlable `<a href>` links between pages.
  Infinite scroll alone is not crawlable; if you use it, keep real links underneath.
- **Raise the cap and prerender the lot** if collections will realistically stay under ~100
  products. Simpler, faster, and perfectly legitimate at this catalogue size.

What is *not* defensible is leaving a silent 48 cap with no indication more exists.

**Done when.** Every `ACTIVE` product is reachable from a collection page by following links only,
with JavaScript disabled.

---

### V-23 — Turn off Accept-Language redirects
**Why.** F12. Google's guidance is explicit that automatic redirection based on perceived language
can prevent users and crawlers from seeing all versions of a site.

**What.** Set `localeDetection: false` in `src/i18n/routing.ts`. Serve English at `/` for everyone,
and let the visitor choose French with a visible language switcher that sets the preference. The
`hreflang` annotations from V-02 are what tell Google which version to *show* — that is their job,
and they do it without a redirect.

Verify afterwards that `curl -H "Accept-Language: fr-CA" https://…/` returns 200 with the English
page, not a 307 to `/fr`.

**Done when.** No locale redirect fires for any `Accept-Language` header on any canonical URL.

---

## 4b. Local SEO — Mississauga, Brampton and the GTA

### Why this is a real programme and not a footnote

I nearly wrote this off. Velvéa ships nationally, and "gift baskets \<city\>" pages for a
nationally-shipping store are doorway pages. Then I read `src/lib/pricing.ts`:

```ts
// GTA cities eligible for local same-day / local standard.
export const GTA_CITIES = [
  "mississauga", "toronto", "brampton", "vaughan", "markham", "richmond hill",
  "oakville", "burlington", "milton", "whitby", "ajax", "pickering", "oshawa",
  "etobicoke", "scarborough", "north york", "north york", "thornhill",
];
```

Two delivery methods exist alongside national shipping — `LOCAL_SAMEDAY` at **$15.00** and
`LOCAL_STANDARD` at **$9.00** — gated on that list and on a **4 PM ET cutoff**
(`sameDayCutoff: "16:00"`). The baskets are hand-packed in Mississauga.

That is a genuine local service with a real footprint, a real price and a real deadline. It is
*not* the doorway-page situation, and it changes the advice: a Brampton page that states Brampton's
actual cutoff, fee, coverage and lead time is a page with something to say. A Brampton page that is
the Mississauga page with the noun swapped is still a doorway page. The tickets below are written
to keep you on the right side of that line.

**Also note the bug in that snippet:** `"north york"` appears twice, and this list is duplicated in
`src/lib/settings-client.ts` as `GTA_CITIES_CLIENT` — where it appears *once*. Two copies of the
delivery area have already drifted. L-01 exists because of this.

---

### L-01 — One source of truth for the delivery area
**Why.** Three things will read this list: checkout pricing, the city pages (L-02) and the
`areaServed` schema (L-03). It is currently defined twice, already inconsistent, and carries no
data beyond a lowercase string — no slug, no display name, no tier, no transit time.

**What.** `src/lib/delivery-area.ts` as the single definition. Each entry:

```ts
{
  slug: "brampton",
  name: "Brampton",
  region: "Peel Region",
  province: "ON",
  tier: 1 | 2,              // 1 = earns a page (L-02); 2 = served, listed, no page
  sameDay: true,
  cutoff: "16:00",          // per city — Brampton may differ from Mississauga
  transitNote: "Same-day when ordered before 4 PM ET",
  postalPrefixes: ["L6P", "L6R", "L6S", …],   // optional, for the coverage answer
}
```

Re-export `GTA_CITIES` / `isGtaCity` from it so `pricing.ts`, `settings-client.ts` and
`CheckoutForm` keep working unchanged, then delete both hardcoded arrays. Fix the `north york`
duplicate on the way through.

**Tiering, concretely.** Tier 1 is the cities where Velvéa has something true and specific to say
and enough commercial weight to justify the page:

| City | Tier | Why |
|---|---|---|
| **Mississauga** | 1 | Home base. The atelier is here, it is already in the H1 of half the site, and it is the only city where "made here" is a claim |
| **Brampton** | 1 | Adjacent, large, Peel Region, high corporate-gifting density (logistics and warehousing corridor) |
| **Toronto** | 1 | Largest query volume in the country for this term; needs its own page or you cede it |
| Oakville, Etobicoke, Vaughan, Markham, Burlington, Milton, Brampton-adjacent rest | 2 | Served, priced, listed on `/delivery` — **no page until someone writes real copy for it** |

Do not promote a city to tier 1 to hit a page count. `LOCAL-SEO.md`'s caveat section is explicit:
*"If you add a sixth city, write it properly or do not add it."*

**Done when.** `grep -rn "GTA_CITIES\|mississauga\"" src/lib/` shows one definition, and checkout
pricing still passes its existing behaviour for a Brampton address.

---

### L-02 — `/delivery/[city]` pages for the tier-1 cities
**Why.** "gift basket delivery mississauga", "same day gift delivery brampton",
"corporate gift baskets toronto" are the highest-intent non-branded queries Velvéa can realistically
win in year one, because local intent narrows the competitive field from national players to the
handful of florists and basket shops actually in the GTA. Domain age matters far less here than it
does for "gift baskets Canada".

**What.** A `/delivery/[city]` route (not `/occasions/...`, not a collection — this is a *service
area* page and its primary entity is the delivery service, not a product list).

**Each page must carry, as the minimum bar for existing:**
1. **The cutoff, in the first 100 words, as a sentence a machine can lift.** "Order by 4 PM ET for
   same-day gift basket delivery in Brampton." This one sentence is the whole AEO play for local.
2. **The actual fee** — $15 same-day, $9 local standard — stated in text, not only at checkout.
3. **Coverage stated concretely**: neighbourhoods and postal prefixes, not "and surrounding areas".
   For Brampton: Bramalea, Heart Lake, Springdale, Castlemore, Downtown Brampton. Answer engines
   and readers both use this to decide "do they come to me".
4. **Something only true of this city.** Mississauga: the atelier, pickup if offered, same-day
   latest. Brampton: the corporate/warehouse corridor, hospital delivery to Brampton Civic.
   Toronto: condo and concierge delivery handling, downtown timing. If you cannot write this
   paragraph honestly, the city is tier 2.
5. **3–5 city-specific FAQs**, marked up per V-07: *"Do you deliver to Brampton Civic Hospital?"*,
   *"What time do same-day Brampton orders leave the atelier?"*, *"Is there a delivery minimum in
   Brampton?"*
6. **A product rail** of the bestsellers eligible for same-day in that city, and links to the two
   or three most relevant collections (corporate, birthday, sympathy).
7. **Breadcrumb** `Home → Delivery → Brampton`, plus a `/delivery` hub listing all 17 cities with
   tier-2 cities linking to the hub anchor rather than to a page that does not exist.

**Word floor: 700 unique words per page.** Below that it is not a page, it is a doorway. Enforce it
in `check-seo.mjs` (V-20).

**What not to do:** do not generate these from a template with a `{city}` variable. Do not create
occasion × city pages. Do not create pages for tier-2 cities. The `/delivery` hub plus the Business
Profile's service-area radius covers them, which is exactly the argument `LOCAL-SEO.md` makes.

**Done when.** Three pages live, each >700 unique words, no shared paragraph between any two, each
carrying its own `FAQPage` and `Service` node.

---

### L-03 — Local structured data
**Why.** This is what connects the site to the Business Profile and tells Google the delivery
service is real and priced.

**What.**
- **`Store`** (the `LocalBusiness` node from V-04) — still gated on a real NAP per F8. When it
  ships: `areaServed` as an array of `City` nodes built from L-01, each with
  `containedInPlace: { "@type": "AdministrativeArea", name: "Ontario, Canada" }`. Copy the exact
  shape from `localBusinessSchema()` in GrowMint's `D:\Grow\Grow\lib\structured-data.ts` —
  the comment there explains why named cities beat a bare `"CA"` for "near me" intent.
- **`Service`** on each city page, modelled on `locationServiceSchema()` in the same file:
  `name: "Gift basket delivery in Brampton"`, `serviceType: "Gift basket delivery"`,
  `provider: { "@id": "…#store" }`, `areaServed` the single city — **the city alone, not the whole
  list.** The sitewide node already declares the full footprint; repeating it here destroys the
  only claim the page-level node exists to make. That reasoning is in the doc comment on
  `serviceAreaSchema()`.
- **`OfferShippingDetails` with regional rates** on the product schema (V-05): a
  `shippingDestination` of `DefinedRegion` for the GTA postal prefixes at $15/$9 with a
  same-day `deliveryTime`, and a national destination at the standard rate. This is the field that
  makes "same-day delivery" machine-readable rather than a marketing line.
- **`hasMap`** pointing at the Business Profile URL, once it exists.
- **`geo`** coordinates — only once they are the real pin. Gated like the rest.

**Done when.** Rich Results Test shows `Store` with 17 `areaServed` cities on the home page, and
each city page shows a `Service` scoped to one city.

---

### L-04 — Google Business Profile
**Why.** The map pack is won by the listing, not the website. For "gift basket delivery near me" in
Mississauga this is roughly the entire game.

**What.** Work `D:\Grow\Grow\LOCAL-SEO.md` (in the GrowMint repo) end to end. It is a 47 KB step-by-step
playbook and every step transfers. The Velvéa-specific answers:

- **Primary category:** `Gift Basket Store`. Secondaries: `Gift Shop`, `Corporate Gift Supplier`,
  `Florist` only if they actually sell flowers, `Delivery Service`.
- **Business type:** the critical fork is §2 of that doc — *"Do customers visit you at this
  address?"*. If the Mississauga atelier does not take walk-ins, answer **No**, which makes it a
  service-area business, hides the street address and shows the delivery area instead. Answering
  Yes without a staffed, signed, publicly-accessible storefront is grounds for suspension.
- **Service areas:** enter the tier-1 and tier-2 cities from L-01. Google caps this at 20 areas —
  17 fits.
- **Hours:** must match `settings.contact.hours` and the site footer exactly. Add the 4 PM same-day
  cutoff as a Business Profile attribute or in the description, because it is the single question
  customers call about.
- **Products:** the Business Profile product feed accepts the catalogue — it is a second surface
  for the same data V-16 already prepares.
- **Photos:** real basket photography, geotagged, added on a schedule. Profile activity is a
  ranking input.

**Blocked on F8.** A real phone number and a real street address are prerequisites. `555-0142` is a
reserved fictional number and cannot be verified. This is the one item on the whole list that
nothing in the codebase can route around.

---

### L-05 — NAP consistency and citations
**Why.** The local pack is decided substantially by whether Google can confirm the same business,
name, address and phone across many independent sources. Inconsistency is the most common reason an
otherwise-good listing does not rank.

**What.**
- Pick **one** canonical NAP string and use it byte-identically in: the Business Profile,
  `src/lib/settings.ts`, the footer, `/contact`, the `Store` schema, `llms.txt`, order emails
  (`src/lib/email.ts` already prints `Velvea · Mississauga, Ontario`), and every directory.
- **Settle the accent first.** The repo uses "Velvea" and "Velvéa" interchangeably — `layout.tsx`
  says `Velvea`, the product schema says `Velvéa`, the admin footer says `Velvea`. Pick the legal
  name for NAP purposes, and declare the other as `alternateName` (V-01 already sets this up). Do
  not let the two forms diverge across directories; that is how one business becomes two entities.
- Citation list, in `LOCAL-SEO.md` §8 order: Bing Places, Apple Business Connect *(matters more
  than its traffic suggests — Apple Maps feeds Siri)*, Yelp Canada, Yellow Pages Canada, 411.ca,
  Facebook Page, Instagram business profile, Canada411, plus gifting-vertical directories.
- Every one of those URLs goes into `sameAs` on the `Organization` node (V-04). That is the machine
  half of the same job, and it is what lets an answer engine reconcile the profiles to one business.

**Done when.** A search for the exact phone number returns the same name and address everywhere it
appears.

---

### L-06 — Local reviews
**Why.** `LOCAL-SEO.md` §9: reviews are the strongest local ranking factor you control after the
profile itself. Velvéa has a structural advantage GrowMint does not — a gift basket has a delivery
moment, and the recipient's delight is the natural review trigger.

**What.**
- **Post-delivery review request email**, fired from the order status transition. `src/lib/email.ts`
  and Resend are already wired, so this is a template and a trigger, not a build.
- Two asks, not one: the **product review** (on-site, feeds V-09 and the star rich result) and the
  **Business Profile review** (feeds the map pack). Ask for the Business Profile one from the
  *purchaser*, timed a day or two after confirmed delivery.
- Send the short review link from the profile dashboard directly. Every extra click loses people.
- Reply to all of them. Google surfaces owner responses.
- **A steady trickle, not a burst.** Ten reviews in one week reads as manipulation; ten over three
  months reads as a working business.
- **Do not** offer discounts or gifts for reviews, write them internally, or review-gate by asking
  happy customers only. It violates Google's policies and review-gating is separately illegal in
  some jurisdictions.

**Done when.** The email fires on delivery confirmation, and both review paths are one click from it.

---

### L-07 — Local content and internal linking
**Why.** Three city pages with no links into them rank for nothing. And local content is the
cheapest genuine link bait Velvéa has — a Mississauga gift guide gets picked up by local blogs and
community pages in a way a national one never will.

**What.**
- The `/delivery` hub in the footer, and the tier-1 cities linked from `/shipping`, `/contact`, the
  `SameDayNotice` component and the checkout local-delivery copy — all places where the sentence is
  *already about* where Velvéa delivers. Do not add a chrome link row; GrowMint retracted exactly
  that change and §3c of `D:\Grow\Grow\VISIBILITY-AUDIT.md` explains why every added link
  has to be honest in its own sentence.
- Two or three genuinely local guides: *"Corporate gifting in Mississauga: what Peel Region
  businesses actually send"*, *"Last-minute gifts in Brampton: what still arrives today"*. These
  link to the city pages and are the pages a local publication might cite.
- **`SameDayNotice`** (`src/components/ui/SameDayNotice.tsx`) already exists and knows the cutoff.
  Surface a live "Order within 3h 12m for same-day delivery in Brampton" state on the city pages —
  urgency that is also a crawlable statement of fact.
- Enforce the inbound-link floor from V-13 on the city pages too.

**Done when.** Each city page has ≥4 inbound internal links from pages whose copy is actually about
delivery areas.

---

## 4c. GEO — the three tickets that are not `llms.txt`

V-11 and V-15 cover the artefacts. These cover the part people skip.

### G-01 — Entity consistency
**Why.** A generative engine answers "who is Velvéa" by reconciling every mention of the name it
has seen. Two spellings, two addresses or three different descriptions produce either a hedged
answer or no mention. This is L-05's job on the off-site half and V-04's on the on-site half — this
ticket is making sure they agree.

**What.** One description paragraph, one NAP, one name plus declared alternates, used verbatim in:
the site, `llms.txt`, the `Organization` node, the Business Profile, every social bio, and every
directory. Write it once in `src/lib/site.ts` and copy *from there* into the off-site properties —
not the other way round.

**Done when.** Asking ChatGPT, Claude and Perplexity "what is Velvéa" returns the same business with
the same city and the same offering. Record the answers with dates; this is the GEO baseline.

### G-02 — Be present where models already read
**Why.** Models cite sources they already trust. For Canadian gifting that means gift round-ups,
local press, Reddit threads (r/askTO, r/Mississauga), Pinterest, and corporate-gifting listicles.
None of this is on-site work and all of it is what actually produces citations.

**What.** Tom's ticket. Target the "best gift baskets in Toronto / Canada" listicles specifically —
those pages are what a model retrieves for the query Velvéa wants to be named in. One inclusion in a
well-ranked round-up is worth more for GEO than any schema in this document.

### G-03 — Machine-checkable facts in the copy
**Why.** Models quote specifics and skip adjectives. "Curated elegance" is unciteable; "$15
same-day delivery in Mississauga, order by 4 PM ET" is citeable, and it is already true.

**What.** Audit the visible copy for claims with no number attached and give them one: price bands
per collection (V-12), the cutoff and fee per city (L-02), lead times per product
(`Product.leadTimeDays` is already on the model and is not surfaced anywhere in the copy), the free
shipping threshold ($150), corporate minimums. Every number must match what checkout actually
charges — a model quoting a stale price is worse than it quoting none.

**Done when.** Every headline claim on the site has a number, a date or a place attached to it.

---

## 5. What no amount of code will do

State this to Tom plainly, because it is where the actual ceiling is. GrowMint's audit reached the
same conclusion after three passes: the technical layer was already ahead of its competitors, and
it was the cheap half.

1. **External links.** Velvéa's domain has no authority and nothing off-site is being built.
   Gift guides, local press, Canadian lifestyle blogs, supplier and maker pages, charity and
   corporate-gifting partners. This is also *the* GEO lever — a model names Velvéa because a page it
   trusts named Velvéa first.
2. **Reviews, in volume.** Google Business Profile reviews and on-site product reviews. Both feed
   rich results; the first also feeds local pack ranking. A review request in the post-delivery
   email is a two-hour build with a longer payoff than any schema in this document.
3. **Real photography with alt text.** A gift store ranks in Image search and on Pinterest. Stock
   Unsplash images (currently allowed in `next.config.ts` remote patterns) rank for nothing.
4. **A real NAP.** See F8. Blocks L-04 entirely (a fictional number cannot be verified) and gates
   both the `Store` node in V-04 and the `areaServed` work in L-03.
5. **Time.** A new domain does not rank for "gift baskets Canada" in ninety days regardless of what
   is in this file. The realistic near-term wins are long-tail occasion and recipient queries,
   branded search, local same-day queries, and AI citations — all of which this work sets up.

---

## 6. Acceptance checklist

Run this against production, not localhost.

**Crawl & index**
- [ ] `robots.txt` resolves, points at the sitemap, allows all AI crawlers
- [ ] `sitemap.xml` lists only indexable URLs, with real `lastmod`
- [ ] Build output shows SSG/ISR on every public route; `ƒ` only on account/checkout/order/admin
- [ ] Every public page has a canonical matching its `og:url`, and hreflang en/fr/x-default
- [ ] Sitemap URLs byte-match their pages' canonicals (trailing slash included)
- [ ] `/search`, `/checkout`, `/account`, `/order/*` all `noindex`
- [ ] Every indexable page has a unique 140–155 char description, in both locales
- [ ] No `Accept-Language` redirect fires on any canonical URL
- [ ] Every `ACTIVE` product reachable from a collection by links alone, JavaScript disabled
- [ ] Product images present in the sitemap

**Structured data** (Rich Results Test, zero errors)
- [ ] `Organization` + `WebSite` + `SearchAction` on every page
- [ ] `Store` on the home page — *or* consciously gated on real NAP
- [ ] `Product` merchant-listing eligible, with shipping and returns
- [ ] `BreadcrumbList` on PDP and all collections
- [ ] `ItemList` on all collections
- [ ] `FAQPage` on `/faq` and ≥3 collection pages
- [ ] `Article` on every guide, with a named `Person` author

**AEO / GEO**
- [ ] `/llms.txt` served, static, current
- [ ] Every FAQ answer opens with the answer, containing the number
- [ ] Price bands, delivery cutoffs and lead times stated in body text, not only in the cart
- [ ] Guides RSS feed valid and linked
- [ ] Full body text present in view-source (not injected on hydration)
- [ ] One name, one NAP, one description across site / `llms.txt` / schema / profiles (G-01)
- [ ] Baseline recorded: what ChatGPT, Claude and Perplexity say about Velvéa today, with the date

**Local**
- [ ] One delivery-area definition; `north york` duplicate gone; both hardcoded arrays deleted
- [ ] `/delivery` hub lists all 17 cities; Mississauga, Brampton, Toronto have pages >700 unique words
- [ ] Each city page states its cutoff and fee in the first 100 words
- [ ] Each city page carries its own `FAQPage` and a single-city `Service` node
- [ ] `Store` node lists all 17 cities in `areaServed` (or is consciously gated on real NAP)
- [ ] `OfferShippingDetails` carries the GTA regional rate alongside the national one
- [ ] Business Profile verified, categories set, service areas matching L-01
- [ ] NAP byte-identical across profile, site, schema, `llms.txt`, emails and every citation
- [ ] Post-delivery review request fires, with both review paths one click away

**Performance**
- [ ] Mobile Lighthouse ≥85 Performance on `/`, a collection, a PDP
- [ ] LCP element is the hero image on all three
- [ ] One `priority` image per page; `sizes` on every grid image

**Measurement**
- [ ] GA4 live in production, gated behind a consent mechanism that ships with it
- [ ] Search Console + Bing verified, sitemaps read
- [ ] IndexNow returns 202 on a production build
- [ ] Merchant Center feed accepted

---

## 7. Landmines

- **Next replaces `openGraph` and `alternates` wholesale — it does not deep-merge them.** Anything
  the root layout sets and a page omits is *gone*, not inherited. This is the single most common way
  a metadata refactor silently breaks every share card. Read the comment at the top of
  `lib/seo.ts` in the GrowMint repo before writing V-02.
- **`opengraph-image.tsx` only applies to the segment that owns it, and only when that segment
  declares no `images` of its own.** A page that sets `openGraph` at all stops inheriting the
  generated card. Hence the `ownCard` flag in V-02.
- **Never emit schema describing something not visible on the page.** Reviews, ratings, authors,
  FAQ answers, prices. This is the rule Google issues manual actions over.
- **Never publish placeholder NAP.** F8.
- **Do not machine-translate content into `fr` to fill the index.** V-18.
- **City pages: three, written properly — not seventeen from a template.** Velvéa's same-day
  footprint earns real delivery-area pages (L-02), and that is the *only* reason they are justified.
  The moment one is generated from a `{city}` variable it becomes a doorway page. Never build
  occasion × city.
- **Do not put `force-dynamic` back** because an admin edit did not appear instantly. That is what
  the on-demand revalidation in V-03 is for.
- **Batch deploys during an indexing push.** Every deploy renames the JS chunks and a fresh crawl
  budget goes into re-downloading them instead of reading new pages — GrowMint measured 53% of
  crawl requests going to JavaScript for exactly this reason.
- **Verify against the installed Next version.** Both repos are on 15.5.x today (Velvéa 15.5.25,
  GrowMint 15.5.22), so the patterns transfer as written. If Velvéa's Next is upgraded, re-check the
  metadata and `ImageResponse` APIs before assuming this file is still accurate.

---

## 8. Suggested order of work

| Phase | Tickets | Why this order |
|---|---|---|
| 1 — foundation | V-01, V-02, V-03, V-23, **L-01** | Everything else writes URLs, reads rendered pages, or reads the city list. Do these first or do them twice |
| 2 — start the clocks | V-15, **L-04**, V-10 | Indexing, measurement and Business Profile verification all lag by weeks. Start them before they are convenient |
| 3 — the graph | V-04, V-05, V-06, V-09, **L-03** | The entity, the rich results, the delivery area |
| 4 — the answers | V-07, V-11, V-08, **G-01** | AEO/GEO surface |
| 5 — local pages | **L-02, L-07, L-05** | The highest-intent queries Velvéa can realistically win in year one |
| 6 — the content | **V-21**, V-12, V-13, V-18, **G-03** | The slow, high-value half. V-21 is a day's writing and the cheapest win here — do it first in this phase, not last |
| 7 — the store | V-16, V-22, V-14, **L-06** | Feed, pagination, vitals, and the review engine |
| 8 — keep it | V-19, V-20 | Guardrails, so phases 1–7 do not rot |

**L-04 is the long pole.** Business Profile verification takes 1–3 weeks and gates the map pack,
the `Store` schema and half of L-05 — which is why it sits in phase 2 rather than with the other
local work, and why F8 (the placeholder phone number) needs an answer from Tom in week one.

**G-02 and section 5 run on Tom's side throughout**, and are the actual ceiling.

### Realistic timing

Adapted from `LOCAL-SEO.md`'s timeline, which was written for a business in the same city:

| When | What |
|---|---|
| Weeks 1–3 | Profile verified. Searching "Velvéa" shows the location panel. This one is near-automatic |
| Weeks 2–4 | Search Console and Bing verified, sitemap read, city pages indexed |
| Months 2–3 | Long-tail local queries start returning the listing. Reviews accumulating |
| Months 3–6 | Realistic window for the Mississauga map pack on "gift basket delivery near me" |
| Months 6–12 | Organic movement on national terms — and only if section 5 is happening |

Anyone promising page one for "gift baskets Canada" inside ninety days is selling something else.
