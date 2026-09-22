"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Loader2, Save, Package, ImageIcon, Truck, TruckElectric,
  Eye, EyeOff, ChevronUp, ChevronDown, Pencil, X,
} from "lucide-react";
import { Card } from "./ui";
import { TextInput, Toggle } from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import {
  upsertBuilderContainer, deleteBuilderContainer,
  upsertBuilderCategory, deleteBuilderCategory,
  upsertBuilderItem, deleteBuilderItem, reorderBuilderItems,
} from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

type Container = { id: string; name: { en: string; fr: string }; priceCents: number; imageUrl: string | null; imagePublicId: string | null; capacity: number; active: boolean };
type Item = { id: string; name: { en: string; fr: string }; priceCents: number; imageUrl: string | null; imagePublicId: string | null; position: number; active: boolean; shippable: boolean };
type Category = { id: string; name: { en: string; fr: string }; position: number; items: Item[] };

export function BuilderManager({ containers, categories }: { containers: Container[]; categories: Category[] }) {
  return (
    <div className="space-y-10">
      {/* Containers */}
      <section>
        <h2 className="mb-3 font-display text-xl">Containers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {containers.map((c) => <ContainerCard key={c.id} container={c} />)}
          <ContainerCard container={null} />
        </div>
      </section>

      {/* Item categories */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Add-on items</h2>
          <NewCategory nextPosition={categories.length} />
        </div>
        <div className="space-y-4">
          {categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
          {categories.length === 0 && <p className="text-sm text-muted">No categories yet. Add one to start.</p>}
        </div>
      </section>
    </div>
  );
}

function ContainerCard({ container }: { container: Container | null }) {
  const isNew = !container;
  const [nameEn, setNameEn] = useState(container?.name.en ?? "");
  const [nameFr, setNameFr] = useState(container?.name.fr ?? "");
  const [price, setPrice] = useState(((container?.priceCents ?? 0) / 100).toString());
  const [capacity, setCapacity] = useState(String(container?.capacity ?? 8));
  const [active, setActive] = useState(container?.active ?? true);
  const [images, setImages] = useState<UploadedImage[]>(container?.imageUrl ? [{ url: container.imageUrl, publicId: container.imagePublicId }] : []);
  const [pending, start] = useTransition();

  function save() {
    start(() => upsertBuilderContainer({
      id: container?.id, nameEn, nameFr, priceCents: Math.round(parseFloat(price) * 100) || 0,
      capacity: parseInt(capacity) || 8, active, imageUrl: images[0]?.url ?? null, imagePublicId: images[0]?.publicId ?? null,
    }).then(() => { if (isNew) { setNameEn(""); setNameFr(""); setPrice("0"); setImages([]); } }));
  }

  return (
    <Card className="space-y-3">
      {isNew && <p className="text-sm font-semibold text-muted">New container</p>}
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
          {images[0]?.url ? <Image src={images[0].url} alt="" fill sizes="64px" className="object-cover" /> : <div className="flex h-full items-center justify-center"><Package className="h-5 w-5 text-line-strong" /></div>}
        </div>
        <div className="flex-1 space-y-2">
          <TextInput value={nameEn} onChange={setNameEn} placeholder="Name (EN)" />
          <TextInput value={nameFr} onChange={setNameFr} placeholder="Nom (FR)" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextInput type="number" value={price} onChange={setPrice} placeholder="Price $" />
        <TextInput type="number" value={capacity} onChange={setCapacity} placeholder="Capacity" />
      </div>
      <ImageUploader images={images} onChange={setImages} folder="velvea/builder" max={1} />
      <div className="flex items-center justify-between">
        <Toggle checked={active} onChange={setActive} label="Active" />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={pending || !nameEn} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:bg-charcoal disabled:opacity-50">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isNew ? "Add" : "Save"}
        </button>
        {!isNew && container && <button onClick={() => start(() => deleteBuilderContainer(container.id))} className="text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>}
      </div>
    </Card>
  );
}

function NewCategory({ nextPosition }: { nextPosition: number }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  // Created with the EN name only; the FR name is set afterwards with the rename
  // control on the category card. New categories land at the end of the list.
  return (
    <div className="flex items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="field w-44 !py-2 text-sm" />
      <button onClick={() => start(() => upsertBuilderCategory({ nameEn: name, nameFr: name, position: nextPosition }).then(() => setName("")))} disabled={pending || !name} className="flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-canvas disabled:opacity-50">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CategoryCard({ category: cat }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [nameEn, setNameEn] = useState(cat.name.en);
  const [nameFr, setNameFr] = useState(cat.name.fr);
  const [pending, start] = useTransition();

  function rename() {
    start(() => upsertBuilderCategory({ id: cat.id, nameEn, nameFr, position: cat.position }).then(() => setEditing(false)));
  }

  function cancel() {
    setNameEn(cat.name.en);
    setNameFr(cat.name.fr);
    setEditing(false);
  }

  /** Swap an item with its neighbour and persist every position in the category
   *  so rows that all sit at position 0 (the default) get a real order. */
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= cat.items.length) return;
    const next = [...cat.items];
    [next[index], next[target]] = [next[target], next[index]];
    start(() => reorderBuilderItems(next.map((it, i) => ({ id: it.id, position: i }))));
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        {editing ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name (EN)" className="field w-44 !py-1.5 text-sm" />
            <input value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="Nom (FR)" className="field w-44 !py-1.5 text-sm" />
            <button onClick={rename} disabled={pending || !nameEn} className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas hover:bg-charcoal disabled:opacity-50">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            <button onClick={cancel} aria-label="Cancel" className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h3 className="truncate font-semibold text-ink">{cat.name.en}</h3>
            {cat.name.fr && cat.name.fr !== cat.name.en && <span className="truncate text-sm text-muted">· {cat.name.fr}</span>}
            <button onClick={() => setEditing(true)} aria-label="Rename category" title="Rename" className="shrink-0 text-muted hover:text-ink"><Pencil className="h-3.5 w-3.5" /></button>
          </div>
        )}
        <button onClick={() => start(() => deleteBuilderCategory(cat.id))} aria-label="Delete category" className="shrink-0 text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="space-y-2">
        {cat.items.map((it, i) => (
          <ItemRow key={it.id} categoryId={cat.id} item={it} nextPosition={cat.items.length}
            onMoveUp={i > 0 ? () => move(i, -1) : undefined}
            onMoveDown={i < cat.items.length - 1 ? () => move(i, 1) : undefined} />
        ))}
        <ItemRow categoryId={cat.id} item={null} nextPosition={cat.items.length} />
      </div>
      {pending && <p className="mt-2 text-xs text-muted">Saving…</p>}
    </Card>
  );
}

function ItemRow({ categoryId, item, nextPosition, onMoveUp, onMoveDown }: {
  categoryId: string;
  item: Item | null;
  /** Position given to a newly created item so it lands at the end of the list. */
  nextPosition: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const isNew = !item;
  const [nameEn, setNameEn] = useState(item?.name.en ?? "");
  const [nameFr, setNameFr] = useState(item?.name.fr ?? "");
  const [price, setPrice] = useState(((item?.priceCents ?? 0) / 100).toString());
  const [active, setActive] = useState(item?.active ?? true);
  const [shippable, setShippable] = useState(item?.shippable ?? true);
  const [images, setImages] = useState<UploadedImage[]>(item?.imageUrl ? [{ url: item.imageUrl, publicId: item.imagePublicId }] : []);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    start(() => upsertBuilderItem({
      id: item?.id, categoryId, nameEn, nameFr, priceCents: Math.round(parseFloat(price) * 100) || 0,
      imageUrl: images[0]?.url ?? null, imagePublicId: images[0]?.publicId ?? null,
      // Re-sending the stored position keeps an edit from resetting the row to 0.
      position: item?.position ?? nextPosition, active, shippable,
    }).then(() => { if (isNew) { setNameEn(""); setNameFr(""); setPrice("0"); setActive(true); setShippable(true); setImages([]); setOpen(false); } }));
  }

  return (
    <div className={cn("rounded-lg border border-line p-2", !active && !isNew && "bg-shell")}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title={open ? "Hide image and French name" : "Image and French name"}
          aria-expanded={open}
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-cream"
        >
          {images[0]?.url
            ? <Image src={images[0].url} alt="" fill sizes="32px" className="object-cover" />
            : <span className="flex h-full items-center justify-center"><ImageIcon className="h-4 w-4 text-line-strong" /></span>}
        </button>
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Item (EN)" className="field min-w-0 flex-1 !py-1.5 text-sm" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="$" className="field w-20 !py-1.5 text-sm" />
        {!isNew && (
          <span className="flex shrink-0 flex-col">
            <button type="button" onClick={onMoveUp} disabled={!onMoveUp} aria-label="Move up" className="text-muted hover:text-ink disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={onMoveDown} disabled={!onMoveDown} aria-label="Move down" className="text-muted hover:text-ink disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
          </span>
        )}
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          title={active ? "Shown in the builder" : "Hidden from the builder"}
          aria-label={active ? "Shown in the builder" : "Hidden from the builder"}
          aria-pressed={!active}
          className={cn(
            "shrink-0 rounded-full border p-1.5 transition-colors",
            active ? "border-line text-muted hover:text-ink" : "border-line-strong bg-sand text-ink-soft"
          )}
        >
          {active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        {/* A custom basket is shippable only if every add-on in it is, so this
            one switch decides whether a whole build can go to a courier. */}
        <button
          type="button"
          onClick={() => setShippable((v) => !v)}
          title={shippable ? "Can be shipped" : "Local delivery and pickup only"}
          aria-label={shippable ? "Can be shipped" : "Local delivery and pickup only"}
          aria-pressed={!shippable}
          className={cn(
            "shrink-0 rounded-full border p-1.5 transition-colors",
            shippable
              ? "border-line text-muted hover:text-ink"
              : "border-amber/50 bg-amber/10 text-amber"
          )}
        >
          {shippable ? <Truck className="h-3.5 w-3.5" /> : <TruckElectric className="h-3.5 w-3.5" />}
        </button>
        <button onClick={save} disabled={pending || !nameEn} aria-label={isNew ? "Add item" : "Save item"} className="shrink-0 rounded-full bg-ink px-2.5 py-1.5 text-xs font-semibold text-canvas disabled:opacity-50">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isNew ? <Plus className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        </button>
        {!isNew && item && <button onClick={() => start(() => deleteBuilderItem(item.id))} aria-label="Delete item" className="shrink-0 text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>
      {open && (
        <div className="mt-2 space-y-2 pl-10">
          <input value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="Nom (FR) — optional" className="field !py-1.5 text-sm" />
          <ImageUploader images={images} onChange={setImages} folder="velvea/builder" max={1} />
          <p className="text-xs text-muted">Changes here are saved with the row&apos;s save button.</p>
        </div>
      )}
    </div>
  );
}
