"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Loader2, Save, Plus, Trash2, ImageIcon } from "lucide-react";
import { Card, Badge } from "./ui";
import { Field, TextInput, LocalizedInput, Toggle, Select } from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { upsertCollection, deleteCollection, reorderCollections, listCollectionProducts, reorderCollectionProducts } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

type CollectionRow = {
  id: string;
  type: "OCCASION" | "RECIPIENT" | "CATEGORY" | "THEME";
  slug: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  imageUrl: string | null;
  imagePublicId: string | null;
  featured: boolean;
  position: number;
  seoTitle: { en: string; fr: string };
  seoDescription: { en: string; fr: string };
  count: number;
};

export function CollectionsManager({ initial }: { initial: CollectionRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [reordering, start] = useTransition();

  const groups = (["OCCASION", "RECIPIENT", "CATEGORY", "THEME"] as const).map((type) => ({
    type,
    rows: initial.filter((c) => c.type === type),
  }));

  /** Swap a row with its neighbour and persist every position in that type
   *  group — the storefront orders within a type, and rows that were never
   *  ordered all sit at 0, so the whole group is rewritten each time. */
  function move(rows: CollectionRow[], index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    start(() => reorderCollections(next.map((r, i) => ({ id: r.id, position: i }))));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-3">
        {reordering && <span className="text-xs text-muted">Saving order…</span>}
        <button onClick={() => setCreating((c) => !c)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal">
          <Plus className="h-4 w-4" /> New collection
        </button>
      </div>

      {creating && (
        <Editor
          row={{ id: "", type: "OCCASION", slug: "", name: { en: "", fr: "" }, description: { en: "", fr: "" }, imageUrl: null, imagePublicId: null, featured: false, position: 0, seoTitle: { en: "", fr: "" }, seoDescription: { en: "", fr: "" }, count: 0 }}
          onDone={() => setCreating(false)}
          isNew
        />
      )}

      {groups.map((g) =>
        g.rows.length ? (
          <div key={g.type}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{g.type.toLowerCase()}</h2>
            <div className="space-y-2">
              {g.rows.map((row, i) => (
                <Card key={row.id} className="!p-0 overflow-hidden">
                  <div className="flex items-center">
                    <button onClick={() => setOpen(open === row.id ? null : row.id)} className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                        {row.imageUrl ? (
                          <Image src={row.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><ImageIcon className="h-4 w-4 text-line-strong" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{row.name.en}</p>
                        <p className="truncate text-xs text-muted">/{row.slug} · {row.count} products</p>
                      </div>
                      {row.featured && <Badge tone="iris">Featured</Badge>}
                      <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open === row.id && "rotate-180")} />
                    </button>
                    {/* Up/down sit outside the expand button: a button inside a button is invalid HTML. */}
                    <span className="flex shrink-0 flex-col border-l border-line px-2">
                      <button type="button" onClick={() => move(g.rows, i, -1)} disabled={reordering || i === 0} aria-label="Move up" className="p-0.5 text-muted hover:text-ink disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => move(g.rows, i, 1)} disabled={reordering || i === g.rows.length - 1} aria-label="Move down" className="p-0.5 text-muted hover:text-ink disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                    </span>
                  </div>
                  {open === row.id && (
                    <div className="space-y-6 border-t border-line p-4">
                      <Editor row={row} onDone={() => setOpen(null)} />
                      <ProductOrder collectionId={row.id} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

function Editor({ row, onDone, isNew }: { row: CollectionRow; onDone: () => void; isNew?: boolean }) {
  const [d, setD] = useState(row);
  const [pending, start] = useTransition();
  const [images, setImages] = useState<UploadedImage[]>(
    row.imageUrl ? [{ url: row.imageUrl, publicId: row.imagePublicId }] : []
  );

  function save() {
    start(async () => {
      await upsertCollection({
        id: isNew ? undefined : d.id,
        type: d.type,
        slug: d.slug,
        nameEn: d.name.en,
        nameFr: d.name.fr,
        descEn: d.description.en,
        descFr: d.description.fr,
        imageUrl: images[0]?.url ?? null,
        imagePublicId: images[0]?.publicId ?? null,
        featured: d.featured,
        position: d.position,
        seoTitleEn: d.seoTitle.en,
        seoTitleFr: d.seoTitle.fr,
        seoDescriptionEn: d.seoDescription.en,
        seoDescriptionFr: d.seoDescription.fr,
      });
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      {isNew && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select value={d.type} onChange={(v) => setD({ ...d, type: v as CollectionRow["type"] })}
              options={[{ value: "OCCASION", label: "Occasion" }, { value: "RECIPIENT", label: "Recipient" }, { value: "CATEGORY", label: "Category" }, { value: "THEME", label: "Theme" }]} />
          </Field>
          <Field label="Slug"><TextInput value={d.slug} onChange={(v) => setD({ ...d, slug: v })} placeholder="birthday" /></Field>
        </div>
      )}
      <LocalizedInput label="Name" en={d.name.en} fr={d.name.fr}
        onEn={(v) => setD({ ...d, name: { ...d.name, en: v } })} onFr={(v) => setD({ ...d, name: { ...d.name, fr: v } })} />
      <LocalizedInput label="Description" en={d.description.en} fr={d.description.fr} textarea rows={2}
        onEn={(v) => setD({ ...d, description: { ...d.description, en: v } })} onFr={(v) => setD({ ...d, description: { ...d.description, fr: v } })} />
      <div>
        <p className="label">Image</p>
        <ImageUploader images={images} onChange={setImages} folder="velvea/collections" max={1} />
      </div>
      <div className="space-y-3 rounded-xl border border-line bg-shell p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Search listing</p>
        <LocalizedInput label="SEO title" en={d.seoTitle.en} fr={d.seoTitle.fr} placeholder="Leave blank to use the name"
          onEn={(v) => setD({ ...d, seoTitle: { ...d.seoTitle, en: v } })} onFr={(v) => setD({ ...d, seoTitle: { ...d.seoTitle, fr: v } })} />
        <LocalizedInput label="SEO description" en={d.seoDescription.en} fr={d.seoDescription.fr} textarea rows={2} placeholder="About 150 characters; leave blank to use the description"
          onEn={(v) => setD({ ...d, seoDescription: { ...d.seoDescription, en: v } })} onFr={(v) => setD({ ...d, seoDescription: { ...d.seoDescription, fr: v } })} />
      </div>
      <Toggle checked={d.featured} onChange={(v) => setD({ ...d, featured: v })} label="Featured" description="Show prominently on the homepage." />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        {!isNew && (
          <button onClick={() => start(() => deleteCollection(d.id).then(onDone))} className="flex items-center gap-1.5 text-sm text-muted hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

type OrderRow = Awaited<ReturnType<typeof listCollectionProducts>>[number];

/**
 * Hand-sorts the products inside one collection. The list is fetched when the
 * collection is expanded rather than with the page, and every position in the
 * collection is rewritten on each move so rows still sitting at the 0 default
 * get a real sequence. Storefront listings use this order unless the shopper
 * picks an explicit sort.
 */
function ProductOrder({ collectionId }: { collectionId: string }) {
  const [rows, setRows] = useState<OrderRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    listCollectionProducts(collectionId)
      .then((r) => live && setRows(r))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [collectionId]);

  function move(index: number, dir: -1 | 1) {
    if (!rows) return;
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next); // optimistic: the arrows stay responsive while the write lands
    start(() =>
      reorderCollectionProducts(
        collectionId,
        next.map((r, i) => ({ productId: r.productId, position: i }))
      )
    );
  }

  if (failed) return <p className="text-sm text-danger">Could not load this collection's products.</p>;
  if (!rows) return <p className="text-sm text-muted">Loading products…</p>;
  if (!rows.length) return <p className="text-sm text-muted">No products in this collection yet.</p>;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Product order</h3>
        {pending && <span className="text-xs text-muted">Saving order…</span>}
      </div>
      <p className="mb-3 text-xs text-muted">The order shoppers see on this collection page, unless they choose a sort.</p>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={r.productId} className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2">
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-cream">
              {r.imageUrl ? (
                <Image src={r.imageUrl} alt="" fill sizes="36px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"><ImageIcon className="h-3.5 w-3.5 text-line-strong" /></div>
              )}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm text-ink">{r.name}</p>
            {r.status !== "ACTIVE" && <Badge tone="gray">{r.status.toLowerCase()}</Badge>}
            <span className="flex shrink-0 flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={pending || i === 0} aria-label="Move up" className="p-0.5 text-muted hover:text-ink disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={pending || i === rows.length - 1} aria-label="Move down" className="p-0.5 text-muted hover:text-ink disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
