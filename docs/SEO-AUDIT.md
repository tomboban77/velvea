# Velvéa: SEO, AEO and GEO audit, 29 Oct 2026

**Goal:** Velvéa shows up when someone in Mississauga or the GTA searches "gift hampers near me",
"gift baskets Mississauga", "same-day gift delivery Toronto" and similar, on Google (map pack and
organic) and when they ask ChatGPT, Gemini, Perplexity or Google's AI Overviews.

**Scope and evidence.** A crawl of all 236 sitemap URLs (EN + FR) on production, run as Googlebot.
Header and redirect checks. Access tests for eight AI and search crawlers. Lighthouse 12 (mobile)
run locally against production on three page types. Web searches for the target queries. A
read of the SEO code (`src/lib/seo.ts`, `collection-page.ts`, `cities.ts`, the layouts) and the
Google Business Profile share link.

**Not visible to this audit:** Search Console data (queries, impressions, index coverage), the
Business Profile dashboard, real-user Core Web Vitals, backlink tools. The first is the most
useful thing missing, see §7.

`SEO-BRIEF.md` (Sept) is the record of the technical build. This document is about what stands
between that build and ranking.

## Status, 29 Oct 2026

**Done in code (needs deploy):** splash off (§3.2), homepage and city page titles (§3.3),
recipient title grammar (§3.4), `LocalBusiness` node on `/` and `/contact` (§3.6), contact page
"How ordering works" and "Where we deliver" sections (§3.7), Google review ask in the delivered
email (§2.3), `llms.txt` lists only stocked collections and adds the guides (§3.9), IndexNow on
product and guide saves (§5.3), splash lockup as WebP (§3.2). `tsc`, lint and 217 tests pass.

**Done in the database (live now):** product SEO titles end in " | Velvéa" on all 38 that had
a suffix (§3.5); "across Ontario" shipping lines changed to "across Canada" on 8 products, all
shippable (§3.8).

**Owner steps to switch the code on:**
- Admin → Settings → Contact → *Google review link*: paste the `g.page/r/...` link from the
  Business Profile (*Ask for reviews*). Until then the email links to the Maps profile.
- Vercel → Production env: `INDEXNOW_KEY` = any UUID, then redeploy. Check
  `https://www.velvea.ca/indexnow.txt` returns it.
- Admin → Settings → *Refresh storefront* after deploying.

**Still open:** everything owner-only in §2, §4, §5.1, §6, and the About/Corporate copy in §3.7
(it needs facts only you have: your name, story, minimums, terms).

---

## 1. Summary

The website itself is technically very good. Every sitemap URL returns 200, canonicals and
hreflang are correct in both languages, there are no duplicate titles or descriptions, structured
data is valid on every page, and all search and AI crawlers are allowed in. Lighthouse SEO is
100/100 on every page tested. Not much more ranking will come from technical work.

**Velvéa doesn't rank yet because almost nothing outside velvea.ca mentions it.**

- A web search for "Velvea gift baskets Mississauga" returns competitors (Gifts For Every Reason,
  Occasionally Gifted, Angie's Baskets) and nothing from Velvéa. A search for "velvea.ca" returns
  only truck parts (Velvac). In that index the brand doesn't exist yet.
- "Near me" searches are answered from the **map pack**, and the map pack ranks **Google Business
  Profiles**, not websites. Google's three factors are relevance, distance and prominence. The
  profile is about five weeks old, has 7 reviews and is missing its description, products, photos
  and the best category.
- AI assistants describe a local business from what *other* sites say about it: directories,
  "best gift baskets in Mississauga" round-ups, review sites, Reddit. Velvéa appears in none of
  these, so the assistants have nothing to repeat.

Most of the work is off-site: the Business Profile, reviews, citations and mentions. The on-site
fixes below are real but smaller. One of them, the splash screen, measurably slows every
first visit.

### Priority list

| # | Action | Who | Effort | Impact on "near me" |
|---|---|---|---|---|
| 1 | Business Profile: switch primary category to **Gift basket store**, fill description, products, photos | Owner | 2 h | Very high |
| 2 | Ask every delivered customer for a Google review (add link to the delivered email) | Code + owner | 1 h code | Very high |
| 3 | Directory listings: Bing Places, Apple Business Connect, Yelp, Facebook page, Yellow Pages + 6 more (§4) | Owner | 3 h | High (map pack + AI) |
| 4 | Get onto the "best gift baskets Mississauga/Toronto" lists and local press (insauga, Narcity, BlogTO) | Owner | Ongoing | High (AI answers) |
| 5 | Turn the first-visit splash off (`SPLASH_ENABLED = false`) | Code | 5 min | Medium (Core Web Vitals) |
| 6 | Homepage title: put "Mississauga" and "hampers" in it | Code | 10 min | Medium |
| 7 | Add a `LocalBusiness` node that matches the Business Profile | Code | 1 h | Medium |
| 8 | Fix recipient page titles ("Gift baskets and hampers A Friend") | Code | 15 min | Low–medium |
| 9 | Expand About, Contact and Corporate pages; add intro copy to thin collections | Owner + code | 1 day | Medium |
| 10 | Google Merchant Center free listings | Owner | Half day | Medium (Shopping tab) |
| 11 | IndexNow for Bing (feeds Copilot and ChatGPT search) | Code | 1 h | Low–medium |
| 12 | Product title suffixes and stale "Ontario" shipping lines in product copy | Owner (admin) | 1 h | Low |

---

## 2. Google Business Profile: the "near me" lever

Profile: `maps.app.goo.gl/c5iCqHs1jYxqjhgf6`, listed as **"Velvea"**, a service-area business with
the address hidden, CID `16710742854240933085`, pinned at 43.6090, -79.6549 (Hurontario, near
Square One).

**A correction to `SEO-BRIEF.md` §6.** It says "a service-area-only listing does not compete for
the Mississauga local pack". That's wrong. Google uses the hidden address for distance, so
service-area businesses do show in the map pack. They just can't show a pin to walk to. The setup
doesn't need changing.

### 2.1 Category (the biggest single relevance signal)

The primary category today is **Gift shop**. Google has a specific category, **Gift basket
store**, and the primary category weighs more in local ranking than anything else on the profile.

- Primary: **Gift basket store**
- Secondary: **Gift shop**, **Corporate gift supplier**. Add **Florist** only if bouquets become a
  real line; today it's two products, and a florist category would pull Velvéa into searches it
  can't serve.

### 2.2 Fields still empty (checklist §4)

- **Description (750 characters).** Say what you are, where you are and what you deliver, in plain
  words. Draft below; write your own version if it doesn't sound like you:

  > Velvea makes gift baskets and gift hampers by hand in Mississauga. Each one is packed to order
  > with gourmet treats, chocolate, coffee, spa and self-care products, and comes with a printed
  > message card. We deliver ourselves across Mississauga, Toronto, Brampton, Oakville, Milton,
  > Vaughan, Markham, Richmond Hill, Burlington, Georgetown and Bolton, with same-day delivery on
  > orders placed before the afternoon cutoff. Baskets that travel well ship by tracked courier
  > across Canada. Corporate orders get volume pricing, branded cards and delivery to many
  > addresses. Free pickup from our Mississauga studio, by appointment. No alcohol.

- **Products.** Add every basket (photo, name, price, link to its velvea.ca page) in 4–6
  collections: Birthday, Corporate, Diwali, Christmas, Spa & self-care, Flowers. Product listings
  feed the "gift basket" relevance signal directly.
- **Photos.** Logo, cover, at least 10 real basket photos, a couple of the packing studio and one
  of a delivery handover. Then add 2–3 new photos a week; regular activity is a known prominence
  signal.
- **Service areas.** List up to 20: Mississauga, Toronto, Etobicoke, North York, Brampton,
  Oakville, Milton, Vaughan, Markham, Richmond Hill, Burlington, Georgetown, Bolton. Service areas
  don't change ranking radius, but they should match the website's delivery pages.
- **Attributes.** Online appointments, onsite services: no, delivery: yes, same-day delivery,
  identifies as women-owned / small business if true.
- **Posts.** One a week: a new basket, a seasonal deadline ("Order Diwali hampers by…"),
  a guide. Link each post to the matching page on velvea.ca.
- **Q&A / FAQ.** Add the top 5 questions from `/faq` yourself, answered.
- **Hours.** Site and profile now both say Mon–Sun 8 am–6 pm (contact page checked live). The
  launch-checklist item about a mismatch is resolved; tick it off once confirmed in the
  profile.
- **Name.** Keep it "Velvea". Don't add keywords ("Velvea Gift Baskets Mississauga"): that
  breaks Google's guidelines and gets profiles suspended.

### 2.3 Reviews

7 reviews, all 5 stars. Competitors in the Mississauga map pack typically have 30–300. Review
count, recency and the words used in reviews ("gift basket", "same-day", "Mississauga") all feed
ranking.

- **Ask every customer, every time.** Add a "How did we do? Leave a Google review" link to
  `sendOrderDelivered` in `src/lib/email.ts` (it has no review link today). Ask everyone, not
  only happy customers: selective asking ("review gating") is against Google's policy.
- Review link: in the Business Profile, choose *Ask for reviews* and copy the `g.page/r/...` link.
- Put a QR code card with the same link in every basket.
- Reply to every review within a few days, naming the basket and the occasion naturally.
- Never offer a discount for a review and never write them yourself (checklist §1 already says so).

---

## 3. On-site findings

### 3.1 What's already right (no action)

| Check | Result |
|---|---|
| Sitemap | 236 URLs (118 EN + 118 FR), all 200, no noindex, no redirects |
| Canonicals | Self-referencing on every URL; `/BASKETS` and trailing slashes canonicalise correctly |
| Hreflang | en-CA / fr-CA / x-default, reciprocal |
| Titles and descriptions | Unique across all 236 URLs |
| Structured data | Valid on every page: Organization, WebSite, Product, BreadcrumbList, CollectionPage, Article, Service, FAQPage |
| Crawler access | 200 for Googlebot, Bingbot, Applebot, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot |
| `llms.txt` | Present and accurate |
| Images | Every content image has an `alt` attribute |
| Lighthouse SEO | 100 on home, Mississauga page and a product page |
| Security headers | HSTS preload, CSP, nosniff: all present |

### 3.2 Splash screen slows every first visit (P1)

`SPLASH_ENABLED = true` (`src/lib/features.ts:43`) covers the page with the welcome animation for
anyone who hasn't visited before. That means every visitor arriving from Google, every
Lighthouse run and most of the visits Chrome reports to Google as Core Web Vitals field data.

Lighthouse mobile, production, 29 Oct:

| Page | Perf | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|
| Home | 77 | 4.9 s | 1.5 s | 220 ms | 0 |
| /delivery/mississauga | 71 | 6.2 s | 2.9 s | 50 ms | 0 |
| Product (Diwali hamper) | 82 | 4.5 s | 1.3 s | 30 ms | 0 |

Google's "good" LCP line is 2.5 s; above 4 s counts as "poor". The server is fast (root document
10–20 ms), so the time goes to rendering. The code comment on the flag already names the splash as
the one thing that can hold up the largest paint.

**Action:** set `SPLASH_ENABLED = false`, deploy, re-run Lighthouse, and compare. If the welcome
matters to the brand, keep it only for direct visits (no referrer) so search and ad traffic land
straight on the page. Then check Search Console → Core Web Vitals after 28 days.

Smaller items from the same runs:
- `/brand/velvea-lockup.png` (82 KB) is used as a CSS background and mask on every page.
  A WebP or SVG version saves ~65 KB per first visit.
- GA's `gtag.js` is ~70 KB of unused JS at load. Acceptable, but it's the largest script.
- Contrast: some text fails WCAG AA (Lighthouse names the elements). Home also flags small touch
  targets.

### 3.3 Titles that miss the main search terms (P1)

The homepage title is "Velvéa — Gift Baskets, Same-Day in the GTA & Shipped Across Canada".
It doesn't contain **Mississauga** or **hampers**, the two words in the target queries. The H1
("Gift baskets & hampers, hand-packed in Mississauga") does, so the fix is only in
`messages/*.json` → `meta`:

- EN: `Gift Baskets & Hampers in Mississauga | Same-Day GTA Delivery | Velvéa`
- FR: `Paniers-cadeaux et coffrets à Mississauga | Livraison le jour même | Velvéa`

`/delivery/mississauga` is the page that should rank for "gift basket delivery Mississauga".
Current title: "Gift baskets and hampers delivered in Mississauga — Velvéa". Lead with the search
phrase instead: `Gift Basket & Hamper Delivery in Mississauga, Same Day | Velvéa`. The same pattern
applies to the other 10 city pages through the shared template in `src/lib/cities.ts`/messages.

### 3.4 Recipient page titles are ungrammatical (P1, bug)

`messages/en.json` → `meta.recipientTitle` is `"Gift baskets and hampers {name}"`. With the stored
names it produces:

- "Gift baskets and hampers A Friend"
- "Gift baskets and hampers Clients"
- "Gift baskets and hampers Employees"

Only "For Him" / "For Her" read correctly. The descriptions have the same problem ("The right
gift basket or hamper clients"). Fix: strip a leading "For " from the name in
`src/lib/collection-page.ts:70` and use `"Gift baskets and hampers for {name}"` (FR: `pour {name}`),
or set a stored SEO title on each of the 8 recipient collections in admin.

### 3.5 Inconsistent brand in product titles (P2)

Product SEO titles are stored per product and use six different suffixes:
"| Velvea", "| Velvéa", "| Velvea Canada", "| Velvea Gift Baskets", "| Velvea Mississauga",
"| Velvea GTA", "| Velvea Gifts". Google treats the brand name as an entity, and mixed forms dilute
it. Pick one (`| Velvéa`, matching every non-product page) and edit the 38 product SEO titles in
Admin → Products. A one-off script could do this with your go-ahead (prod DB write).

### 3.6 No LocalBusiness markup (P1)

`organizationJsonLd()` (`src/lib/seo.ts:279`) emits a plain `Organization` with
`areaServed: Canada`. The comment says this is because the business is online-only. That decision
predates the Business Profile and the by-appointment pickup, which are now settled facts.

Google's local-business structured data is meant to match the Business Profile and helps tie
the website to the map listing. Recommended: keep the Organization node and add a
`LocalBusiness` node on the homepage and `/contact`:

```json
{
  "@type": "LocalBusiness",
  "@id": "https://www.velvea.ca/#localbusiness",
  "name": "Velvea",
  "alternateName": "Velvéa",
  "url": "https://www.velvea.ca/",
  "image": "https://www.velvea.ca/brand/velvea-og.png",
  "telephone": "+1-431-726-1706",
  "priceRange": "$59–$499",
  "address": { "...": "same as Organization" },
  "geo": { "@type": "GeoCoordinates", "latitude": 43.6090, "longitude": -79.6549 },
  "hasMap": "https://www.google.com/maps?cid=16710742854240933085",
  "openingHoursSpecification": [{ "dayOfWeek": ["Monday", "...", "Sunday"], "opens": "08:00", "closes": "18:00" }],
  "areaServed": ["Mississauga", "Toronto", "Brampton", "...the 11 city pages"],
  "parentOrganization": { "@id": "https://www.velvea.ca/#organization" }
}
```

Fill hours, price range and areas from settings and `cities.ts`, not hard-coded. The address is
already published on the site, so this exposes nothing new. If you'd rather keep the street
address off the site too, drop `address` and `geo` and keep the rest.

### 3.7 Thin pages that matter for trust (P2)

Words of main content, from the crawl:

| Page | Words | Why it matters |
|---|---|---|
| /contact | 57 | The page Google and AI tools check for NAP and legitimacy |
| /about | 225 | The E-E-A-T page: who runs this, since when, why trust it |
| /corporate | 200 | "Corporate gifts Mississauga" is the highest-value query you serve |
| /category/flowers, /category/baby | 61–66 | Near-empty grids |
| /occasions/fathers-day, retirement, sympathy, new-baby | 74–101 | Seasonal or near-empty |
| /recipients/new-parents | 73 | Near-empty |

- **About:** your name and face, the studio, how a basket is made (photos), how many you've
  delivered, where products come from, the no-alcohol stance. AI tools quote About pages directly.
- **Contact:** add the service-area list, a link to the Google profile, response time, the
  corporate quote link and a short "how to order" paragraph.
- **Corporate:** minimums, lead times, price tiers, branding options, a sample client list or
  quote (with permission), invoicing/payment terms, a FAQ block. Aim for the page that answers
  everything a company's office manager would otherwise phone about.
- **Collections:** a 60–120 word intro on each collection with products (what goes in, price
  range, delivery note). Collections with 0–1 products should stay off the menus until stocked;
  the empty ones are already noindex automatically.

### 3.8 Stale shipping lines in product copy (P2)

Product descriptions written before 29 Oct say "tracked shipping across Ontario" (example:
`/products/diwali-celebration-gift-hamper`), while the page around them says "across Canada".
Search Admin → Products for "across Ontario" and update. The JSON-LD reuses the description, so
Google sees the old claim too.

### 3.9 Smaller technical items (P3)

- `http://velvea.ca` takes two hops (→ `https://velvea.ca/` → `https://www.velvea.ca/`). HSTS
  preload makes this invisible to most browsers; one hop would be tidier (Vercel domain settings).
- `/en` redirects with a 307 (temporary); 308 is the right code. next-intl behaviour, low impact.
- 42 of the 118 English descriptions run past ~160 characters and will be cut off in results (the longest are product
  pages at 200–218). Editorial, not a ranking issue.
- Product JSON-LD has no `shippingDetails`. Search Console shows it as a non-critical warning.
  The overlap problem is written up in `SEO-BRIEF.md` V-03; Merchant Center (§6) is the
  better place to declare shipping.
- `/guides` has no `CollectionPage`/`Blog` markup. Optional.
- `llms.txt` lists collections that are empty and noindex (Sympathy, New Baby, Wedding, Fresh
  Fruit, Vegan, Baby) and none of the 15 guides. Generate the browse list from collections that
  have products, and add a "Guides" section.

---

## 4. Citations and directories

Google cross-checks name, address/area and phone across the web, and Bing, Apple and the AI
tools read their own sources. Use the exact same details everywhere:

> **Velvea** · 5105 Hurontario Street, Mississauga, ON L4Z 0C9 (hidden where the platform allows) ·
> +1 (431) 726-1706 · https://www.velvea.ca/ · Mon–Sun 8 am–6 pm

In order:

1. **Bing Places for Business**: import from Google in one click. Bing's index powers Copilot,
   DuckDuckGo and much of ChatGPT search.
2. **Apple Business Connect**: Apple Maps and Siri ("gift baskets near me" on an iPhone).
3. **Facebook page**, then add it to Admin → Settings → social so it joins `sameAs`.
4. **Yelp** (Canada): free listing; Yelp is a frequent AI citation source.
5. **YellowPages.ca**, **411.ca**, **Canpages**: the main Canadian aggregators.
6. **Foursquare / Swarm**: feeds a number of apps and AI datasets.
7. **Mississauga Board of Trade** membership directory (paid, but a real local link).
8. **Nextdoor business page** for Mississauga neighbourhoods.
9. **Etsy or Shopify-style marketplaces are not needed.** Skip paid "citation packages".

Keep a simple sheet: site, URL, login, date listed. Inconsistent old listings hurt more than
missing ones.

---

## 5. AEO / GEO: being the answer in AI tools

When someone asks ChatGPT "where can I get a gift hamper delivered same day in Mississauga?",
the answer is assembled from web search results (Bing for ChatGPT and Copilot, Google for
Gemini and AI Overviews) and from pages that list and compare local businesses. A good llms.txt
and FAQ markup don't help if no third party mentions you, and today none does.

### 5.1 Get onto the lists AI tools read

The searches for this audit surfaced: Narcity ("Best gift baskets you can order in Toronto"),
BlogTO, Post City, Streets of Toronto, Groupon local, Trustpilot, Yelp "Top 10" lists.

- **insauga.com** (Mississauga's main local news site): pitch the story. Local studio, same-day,
  Diwali and corporate angles. The published `velvea-gift-hampers-gta` guide is the press kit.
- **Narcity, BlogTO, Streets of Toronto, Mississauga.com/Toronto Star community**: their
  gift-basket round-ups are refreshed every November/December. Email the writers in early
  November with photos, prices and the same-day promise.
- **ThreeBestRated.ca, Expertise.com, Best of Mississauga**-style lists: most have a free
  submission or are driven by Google review counts.
- **Suppliers and partners**: INARA candles (already a guide) and every brand on `/partners`
  should link back to velvea.ca from their stockists page.
- **Reddit (r/mississauga, r/askTO, r/BramptonON)**: genuine answers only, from a personal account
  that says who you are. AI tools quote Reddit heavily; promotional posts get removed.
- **Trustpilot**: a free business profile. It already ranks for competitors' names.

### 5.2 On-site answer content

The site is in better shape here than most local shops: 15 guides, FAQ and 11 city pages with
direct question-and-answer blocks. To make it easier to quote:

- Start each city page with one plain sentence an assistant can lift as-is: "Velvéa delivers gift
  baskets and hampers anywhere in Mississauga for $9.99, same day on orders before 4 pm."
- Add a short "Velvéa at a glance" block to `/about`: founded 2026, Mississauga studio, owner's
  name, delivery areas, price range $59–$499, no alcohol, bilingual. Facts, no adjectives.
- Keep every fact identical across the site, the profile, `llms.txt` and directories (cutoff
  times, fees, areas). Assistants drop businesses whose details conflict.

### 5.3 Bing and IndexNow

Bing Webmaster Tools is verified. Add **IndexNow**: when a product, guide or collection is
published or edited, ping `api.indexnow.org` with the URL. It's a small route plus a key file in
`public/`, called from the admin save actions. Bing typically indexes within hours instead of
days, which is what ChatGPT and Copilot search draw from.

---

## 6. Google Merchant Center (free listings)

Real orders and reviews exist now. Free listings put baskets in the Google Shopping tab, in
image search and in product panels for "gift basket" queries. Shoppers search there before they
ever see a website result.

- Create the account under giftsvelvea@gmail.com, link it to the Business Profile and verify the
  site (Search Console verification carries over).
- Declare shipping (local zones by postal code and courier rates) and the return policy (final
  sale, damage remedy) in Merchant Center itself. That also resolves the `shippingDetails` gap
  in §3.9.
- Feed: start with Merchant Center's automatic website crawl (it reads the existing Product
  JSON-LD). A proper feed route can come later.
- Checklist §1 asks for evidence on dietary and origin claims first. Products with no such claims
  can go in now.

---

## 7. Measurement

Nothing here can promise a ranking or a date. Track these and judge the work by them:

- **Search Console → Performance**, filtered to queries containing "mississauga", "gta",
  "toronto", "near me", "hamper". Export monthly. Sharing an export would show which pages are
  already getting impressions, so the work can be pointed at those.
- **Business Profile → Performance**: searches, map views, calls, website clicks, direction
  requests. The "searches" breakdown shows the exact terms that surfaced you.
- **Map-pack position** from a few points in Mississauga (Square One, Port Credit, Meadowvale,
  Malton) for "gift basket", "gift hamper", "gift basket delivery". A free grid check (e.g. Local
  Falcon trial) once a month is enough.
- **AI answers**: once a month, ask ChatGPT, Gemini, Perplexity and Copilot the same five
  questions ("best gift basket delivery Mississauga", "same-day gift hamper GTA", "corporate gift
  baskets Mississauga", "Diwali hampers Brampton", "gift baskets near Square One"). Note whether
  Velvéa is named and what it cites. These answers vary run to run; look for the trend.
- **Core Web Vitals** in Search Console after the splash change.

### Realistic timeline

- **Weeks 1–4** (profile complete, citations live, review requests running): map-pack appearances
  start for searches made close to the studio, i.e. central Mississauga.
- **Months 2–4** (20–40 reviews, press/list mentions, Christmas content): wider Mississauga radius,
  city pages start ranking for "gift basket delivery [city]", first AI mentions.
- **Months 4–12**: competing for "gift baskets Toronto"/"GTA" depends almost entirely on reviews
  and mentions; those terms are dominated by older shops with many reviews.

---

## 8. Code changes ready to make

All small and isolated. Each needs `tsc`, lint and tests, then deploy:

1. `SPLASH_ENABLED = false` (§3.2)
2. Homepage and city page titles (§3.3), EN + FR messages
3. Recipient title/description grammar (§3.4) + a test in `tests/seo.test.ts` or a new suite
4. `localBusinessJsonLd()` in `src/lib/seo.ts`, emitted from the locale layout and `/contact`,
   built from settings + `cities.ts`, with tests (§3.6)
5. Google review link in `sendOrderDelivered` (§2.3); the link stored in settings, not hard-coded
6. `llms.txt` browse list from non-empty collections, plus guides (§3.9)
7. IndexNow route + calls from admin product/article/collection saves (§5.3)
8. Lockup image as WebP/SVG (§3.2)

Owner-only: §2 (Business Profile), §4 (citations), §5.1 (press and lists), §6 (Merchant
Center), product title and copy edits in admin (§3.5, §3.8), and About/Contact/Corporate copy
(§3.7). The title/copy edits can be scripted with your go-ahead.
