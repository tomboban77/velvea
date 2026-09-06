# Velvea — Premium Gift Baskets

A bilingual (English/French) gift-basket e-commerce store with a dedicated admin backend.
Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Prisma, and PostgreSQL (Neon).

Founded 2026 · Mississauga, Ontario · Woman-owned.

---

## What's included

**Storefront**
- Elegant, animated homepage (hero, occasions, gift finder, corporate, delivery map, guides, reviews, FAQ).
- Catalog: all baskets, by occasion, by recipient, by category, with sort and price filters.
- Product pages with gallery, variants, contents, reviews, and quick add-to-cart.
- **Custom Basket builder** — pick a vessel, add items, live pricing.
- Cart drawer + full checkout with **Stripe Checkout** (falls back to an offline order until Stripe keys are set).
- Canada-wide tax (by province) and shipping, same-day GTA delivery detection, discount codes, gift cards.
- Corporate quote requests, gift guides/blog, customer accounts and order history.
- Full **English + French** with a language switcher.

**Admin** (`/admin`)
- Dashboard with revenue, orders, and quick actions.
- Products CRUD with drag-to-order **image uploads** (Cloudinary), variants, collections, badges, SEO.
- Collections, custom-builder, discounts, gift cards, orders (status timeline), review moderation,
  corporate inquiries, gift guides, newsletter, and editable store settings.

---

## Prerequisites

- Node.js 20+ (tested on 22)
- A PostgreSQL database (a free [Neon](https://neon.tech) project works and is already configured)

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npx prisma migrate deploy # or: npm run db:migrate   (creates the tables)
npm run db:seed           # sample products, collections, admin user, etc.
npm run dev               # http://localhost:3000
```

The database connection is already set in `.env` (Neon). The seed prints the admin login.

### Admin access

- URL: `http://localhost:3000/admin`
- Email: `admin@velvea.ca`
- Password: `Velvea!2026`  ← **change this in production** (see below)

Change the seed admin by setting `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding,
or create/reset a user from the database.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres (pooled) connection for the app |
| `DIRECT_URL` | ✅ | Postgres (direct) connection for migrations |
| `AUTH_SECRET` | ✅ | Signs session JWTs (generate: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public base URL (emails, Stripe redirects) |
| `STRIPE_SECRET_KEY` | – | Enables card payments (test key `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | – | Verifies Stripe webhooks (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | – | Client publishable key |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | – | Enables admin image uploads |
| `RESEND_API_KEY` | – | Sends order/quote emails (logs to console otherwise) |
| `EMAIL_FROM`, `ORDER_NOTIFY_EMAIL` | – | Email sender + internal notifications |

**Everything runs without the optional keys.** Until they're added:
- Checkout creates a real order and shows the confirmation page (payment collected offline).
- Admin image upload returns a friendly "not configured" message.
- Emails are printed to the server console instead of sent.

### Turning on Stripe (test mode)
1. Create a [Stripe](https://dashboard.stripe.com) account, copy the **test** secret + publishable keys into `.env`.
2. For local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and paste the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.
   (The order-confirmation page also verifies the session directly, so payments settle even without the webhook.)

### Turning on Cloudinary (image uploads)
Create a free [Cloudinary](https://cloudinary.com) account and copy the cloud name, API key, and secret into `.env`.

### Turning on email (Resend)
Create a [Resend](https://resend.com) account, verify your domain, and set `RESEND_API_KEY` and `EMAIL_FROM`.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:migrate` | Create/apply a migration (dev) |
| `npm run db:seed` | Seed sample data + admin user |
| `npm run db:studio` | Open Prisma Studio (browse the DB) |
| `npm run db:reset` | Drop, re-migrate, and re-seed |

---

## Deploying to Vercel + Neon

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add all `.env` variables in the Vercel project settings (use the Neon **pooled** URL for `DATABASE_URL`
   and the **direct** URL for `DIRECT_URL`). Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Run the migration against production once: `npx prisma migrate deploy` (or add it to the build command).
4. In Stripe, add a webhook endpoint `https://your-domain/api/stripe/webhook` and copy its signing secret
   into `STRIPE_WEBHOOK_SECRET`.

---

## Project structure

```
src/
  app/
    [locale]/          storefront (en default at /, fr at /fr)
    admin/             admin panel (login + (panel) route group)
    api/               newsletter, reviews, corporate, upload, stripe webhook
  components/          brand, layout, home, shop, cart, checkout, custom, corporate, account, admin
  lib/                 prisma, auth, settings, pricing, stripe, cloudinary, email, queries, actions/*
  i18n/                next-intl routing + request config
messages/              en.json, fr.json (UI copy)
prisma/                schema.prisma, migrations, seed.ts
```

Translatable catalog/content text is stored as JSON `{ en, fr }`, so adding a language later is straightforward.
