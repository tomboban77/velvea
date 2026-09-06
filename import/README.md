# Bulk product import

Add many products at once, with images, in one command.

## Steps

1. **Add your photos** to `import/images/`
   Any filenames, e.g. `for-mom-1.jpg`, `gentlemans-retreat.jpg`.

2. **Create `import/products.json`**
   Copy `products.example.json` to `products.json` and fill it with your products.
   It's a JSON array — one object per product. See the fields below.

3. **Run the import** from the `velvea` folder:
   ```
   npm run import:products
   ```
   Each image is uploaded to Cloudinary and each product is created.
   Re-running updates products that already exist (matched by name/slug) and replaces their images.

## Fields (per product)

| Field | Required | Notes |
|---|---|---|
| `name` | yes | `"..."` (English) or `{ "en": "...", "fr": "..." }` |
| `price` | yes | dollars, e.g. `129.00` (or use `priceCents`) |
| `tagline` | no | short line for cards; string or `{en, fr}` |
| `description` | no | paragraph; string or `{en, fr}` |
| `contents` | no | array of items; each a string or `{en, fr}` |
| `compareAt` | no | dollars; shows a strikethrough sale price |
| `sku` | no | internal code |
| `status` | no | `ACTIVE` (default `ACTIVE` in the importer; use `DRAFT` to hide) |
| `featured` | no | `true`/`false` — show on homepage |
| `bestseller` | no | `true`/`false` |
| `badges` | no | any of `new`, `bestseller`, `limited`, `sale` |
| `occasions` | no | slugs or labels (see below) |
| `recipients` | no | slugs or labels |
| `categories` | no | slugs or labels |
| `images` | no | array of filenames that exist in `import/images/` |
| `variants` | no | `[{ "label": "$100", "price": 100 }]` |
| `seoTitle` / `seoDescription` | no | string or `{en, fr}` |
| `slug` | no | auto-generated from the name if omitted |

French is optional everywhere — if you leave `fr` out, it falls back to English.

## Collection slugs

Use these slugs (or the plain labels) in `occasions`, `recipients`, `categories`:

- **Occasions:** birthday, anniversary, thank-you, sympathy, new-baby, get-well, congratulations, housewarming, wedding, holiday
- **Recipients:** for-him, for-her, couples, new-parents, family, clients, employees, a-friend
- **Categories:** gourmet, chocolate, wine-spirits, spa-wellness, coffee-tea, fresh-fruit, vegan, baby

## Tip for AI tools

Give the tool this brief: *"Velvea — premium gift baskets, hand-packed in Mississauga, delivered across Canada. Elegant, understated tone. Output a JSON array matching this schema."* Attach each product photo so it can list the real items for `contents`.
