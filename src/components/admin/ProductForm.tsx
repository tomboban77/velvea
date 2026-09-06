"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Field,
  TextInput,
  LocalizedInput,
  MoneyInput,
  Toggle,
  Select,
} from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { Card } from "./ui";
import { createProduct, updateProduct, type ProductInput } from "@/lib/actions/products";
import { cn } from "@/lib/utils";

type L = { en: string; fr: string };
const emptyL = (): L => ({ en: "", fr: "" });

type CollectionOpt = { id: string; type: string; label: string };

export type ProductFormData = {
  id?: string;
  slug: string;
  name: L;
  tagline: L;
  description: L;
  care: L;
  contents: L[];
  priceCents: number;
  compareAtCents: number | null;
  sku: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  bestseller: boolean;
  badges: string[];
  leadTimeDays: number;
  weightGrams: number | null;
  inventory: number | null;
  collectionIds: string[];
  images: UploadedImage[];
  variants: { label: L; priceCents: number; compareAtCents: number | null; sku: string }[];
  seoTitle: L;
  seoDescription: L;
};

export function emptyProduct(): ProductFormData {
  return {
    slug: "",
    name: emptyL(),
    tagline: emptyL(),
    description: emptyL(),
    care: emptyL(),
    contents: [],
    priceCents: 0,
    compareAtCents: null,
    sku: "",
    status: "DRAFT",
    featured: false,
    bestseller: false,
    badges: [],
    leadTimeDays: 1,
    weightGrams: null,
    inventory: null,
    collectionIds: [],
    images: [],
    variants: [],
    seoTitle: emptyL(),
    seoDescription: emptyL(),
  };
}

const BADGES = ["new", "bestseller", "limited", "sale"];

export function ProductForm({
  initial,
  collections,
}: {
  initial: ProductFormData;
  collections: CollectionOpt[];
}) {
  const router = useRouter();
  const [d, setD] = useState<ProductFormData>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  function toggleCollection(id: string) {
    set(
      "collectionIds",
      d.collectionIds.includes(id)
        ? d.collectionIds.filter((c) => c !== id)
        : [...d.collectionIds, id]
    );
  }

  function submit() {
    setError(null);
    if (!d.name.en.trim()) return setError("Product name (EN) is required.");
    if (!d.priceCents || d.priceCents <= 0) return setError("Set a price above $0.");

    const payload: ProductInput = {
      slug: d.slug || undefined,
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      care: d.care,
      contents: d.contents,
      priceCents: d.priceCents,
      compareAtCents: d.compareAtCents,
      sku: d.sku,
      status: d.status,
      featured: d.featured,
      bestseller: d.bestseller,
      badges: d.badges,
      leadTimeDays: d.leadTimeDays,
      weightGrams: d.weightGrams,
      inventory: d.inventory,
      collectionIds: d.collectionIds,
      images: d.images,
      variants: d.variants,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
    };

    startTransition(async () => {
      try {
        if (d.id) await updateProduct(d.id, payload);
        else await createProduct(payload);
        router.push("/admin/products");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  const byType = (type: string) => collections.filter((c) => c.type === type);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-danger">{error}</span>}
          <button
            onClick={submit}
            disabled={pending}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {d.id ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5">
            <LocalizedInput
              label="Name"
              en={d.name.en}
              fr={d.name.fr}
              onEn={(v) => set("name", { ...d.name, en: v })}
              onFr={(v) => set("name", { ...d.name, fr: v })}
              placeholder="e.g. Noel Nights Gourmet Basket"
            />
            <LocalizedInput
              label="Tagline"
              en={d.tagline.en}
              fr={d.tagline.fr}
              onEn={(v) => set("tagline", { ...d.tagline, en: v })}
              onFr={(v) => set("tagline", { ...d.tagline, fr: v })}
              placeholder="Short one-liner shown on cards"
            />
            <LocalizedInput
              label="Description"
              en={d.description.en}
              fr={d.description.fr}
              onEn={(v) => set("description", { ...d.description, en: v })}
              onFr={(v) => set("description", { ...d.description, fr: v })}
              textarea
              rows={5}
            />
          </Card>

          <Card>
            <h3 className="mb-3 font-display text-lg">Images</h3>
            <ImageUploader images={d.images} onChange={(imgs) => set("images", imgs)} />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">What&apos;s inside</h3>
              <button
                type="button"
                onClick={() => set("contents", [...d.contents, emptyL()])}
                className="flex items-center gap-1 text-sm font-medium text-gold hover:gap-2"
              >
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
            {d.contents.length === 0 && (
              <p className="text-sm text-muted">List the products included in this basket.</p>
            )}
            <div className="space-y-2">
              {d.contents.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    value={c.en}
                    onChange={(v) =>
                      set(
                        "contents",
                        d.contents.map((x, idx) => (idx === i ? { ...x, en: v } : x))
                      )
                    }
                    placeholder="Item (EN)"
                  />
                  <TextInput
                    value={c.fr}
                    onChange={(v) =>
                      set(
                        "contents",
                        d.contents.map((x, idx) => (idx === i ? { ...x, fr: v } : x))
                      )
                    }
                    placeholder="Item (FR)"
                  />
                  <button
                    type="button"
                    onClick={() => set("contents", d.contents.filter((_, idx) => idx !== i))}
                    className="text-muted hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Size / variants</h3>
              <button
                type="button"
                onClick={() =>
                  set("variants", [
                    ...d.variants,
                    { label: emptyL(), priceCents: d.priceCents, compareAtCents: null, sku: "" },
                  ])
                }
                className="flex items-center gap-1 text-sm font-medium text-gold hover:gap-2"
              >
                <Plus className="h-4 w-4" /> Add variant
              </button>
            </div>
            {d.variants.length === 0 && (
              <p className="text-sm text-muted">Optional. Leave empty for a single-size product.</p>
            )}
            {d.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                <TextInput
                  value={v.label.en}
                  onChange={(val) =>
                    set(
                      "variants",
                      d.variants.map((x, idx) =>
                        idx === i ? { ...x, label: { ...x.label, en: val } } : x
                      )
                    )
                  }
                  placeholder="Label (e.g. Grande)"
                />
                <TextInput
                  value={v.label.fr}
                  onChange={(val) =>
                    set(
                      "variants",
                      d.variants.map((x, idx) =>
                        idx === i ? { ...x, label: { ...x.label, fr: val } } : x
                      )
                    )
                  }
                  placeholder="Libellé (FR)"
                />
                <div className="w-28">
                  <MoneyInput
                    cents={v.priceCents}
                    onChange={(c) =>
                      set(
                        "variants",
                        d.variants.map((x, idx) =>
                          idx === i ? { ...x, priceCents: c ?? 0 } : x
                        )
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => set("variants", d.variants.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg">SEO</h3>
            <LocalizedInput
              label="Meta title"
              en={d.seoTitle.en}
              fr={d.seoTitle.fr}
              onEn={(v) => set("seoTitle", { ...d.seoTitle, en: v })}
              onFr={(v) => set("seoTitle", { ...d.seoTitle, fr: v })}
            />
            <LocalizedInput
              label="Meta description"
              en={d.seoDescription.en}
              fr={d.seoDescription.fr}
              onEn={(v) => set("seoDescription", { ...d.seoDescription, en: v })}
              onFr={(v) => set("seoDescription", { ...d.seoDescription, fr: v })}
              textarea
              rows={2}
            />
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-display text-lg">Status</h3>
            <Select
              value={d.status}
              onChange={(v) => set("status", v as ProductFormData["status"])}
              options={[
                { value: "DRAFT", label: "Draft (hidden)" },
                { value: "ACTIVE", label: "Active (published)" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
            <Toggle
              checked={d.featured}
              onChange={(v) => set("featured", v)}
              label="Featured"
              description="Show on the homepage and featured rows."
            />
            <Toggle
              checked={d.bestseller}
              onChange={(v) => set("bestseller", v)}
              label="Bestseller"
              description="Include in bestselling collections."
            />
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg">Pricing</h3>
            <Field label="Price">
              <MoneyInput cents={d.priceCents} onChange={(c) => set("priceCents", c ?? 0)} />
            </Field>
            <Field label="Compare-at price" hint="Optional. Shows a strikethrough sale price.">
              <MoneyInput
                cents={d.compareAtCents}
                onChange={(c) => set("compareAtCents", c)}
              />
            </Field>
            <Field label="SKU">
              <TextInput value={d.sku} onChange={(v) => set("sku", v)} placeholder="VLV-001" />
            </Field>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-display text-lg">Collections</h3>
            {(["OCCASION", "RECIPIENT", "CATEGORY", "THEME"] as const).map((type) => {
              const opts = byType(type);
              if (!opts.length) return null;
              return (
                <div key={type}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    {type.toLowerCase()}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {opts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCollection(c.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          d.collectionIds.includes(c.id)
                            ? "border-ink bg-ink text-canvas"
                            : "border-line-strong text-ink-soft hover:border-ink"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {collections.length === 0 && (
              <p className="text-sm text-muted">
                No collections yet. Create some under Collections first.
              </p>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="font-display text-lg">Badges</h3>
            <div className="flex flex-wrap gap-1.5">
              {BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() =>
                    set(
                      "badges",
                      d.badges.includes(b)
                        ? d.badges.filter((x) => x !== b)
                        : [...d.badges, b]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                    d.badges.includes(b)
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line-strong text-ink-soft hover:border-ink"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-display text-lg">Logistics</h3>
            <Field label="Lead time (days)">
              <TextInput
                type="number"
                value={String(d.leadTimeDays)}
                onChange={(v) => set("leadTimeDays", parseInt(v) || 0)}
              />
            </Field>
            <Field label="Inventory" hint="Leave empty for unlimited.">
              <TextInput
                type="number"
                value={d.inventory === null ? "" : String(d.inventory)}
                onChange={(v) => set("inventory", v === "" ? null : parseInt(v) || 0)}
              />
            </Field>
            <Field label="Slug" hint="Auto-generated from the name if left blank.">
              <TextInput value={d.slug} onChange={(v) => set("slug", v)} placeholder="noel-nights" />
            </Field>
          </Card>
        </div>
      </div>
    </div>
  );
}
