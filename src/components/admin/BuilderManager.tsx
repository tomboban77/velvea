"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Save, Package, ImageIcon } from "lucide-react";
import { Card } from "./ui";
import { TextInput, Toggle } from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import {
  upsertBuilderContainer, deleteBuilderContainer,
  upsertBuilderCategory, deleteBuilderCategory,
  upsertBuilderItem, deleteBuilderItem,
} from "@/lib/actions/admin";
import { formatMoney } from "@/lib/utils";

type Container = { id: string; name: { en: string; fr: string }; priceCents: number; imageUrl: string | null; imagePublicId: string | null; capacity: number; active: boolean };
type Item = { id: string; name: { en: string; fr: string }; priceCents: number; imageUrl: string | null; imagePublicId: string | null; active: boolean };
type Category = { id: string; name: { en: string; fr: string }; items: Item[] };

export function BuilderManager({ containers, categories }: { containers: Container[]; categories: Category[] }) {
  const [pending, start] = useTransition();

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
          <NewCategory />
        </div>
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">{cat.name.en}</h3>
                <button onClick={() => start(() => deleteBuilderCategory(cat.id))} className="text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {cat.items.map((it) => <ItemRow key={it.id} categoryId={cat.id} item={it} />)}
                <ItemRow categoryId={cat.id} item={null} />
              </div>
            </Card>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted">No categories yet. Add one to start.</p>}
        </div>
      </section>
      {pending && <p className="text-xs text-muted">Saving…</p>}
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

function NewCategory() {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="field w-44 !py-2 text-sm" />
      <button onClick={() => start(() => upsertBuilderCategory({ nameEn: name, nameFr: name }).then(() => setName("")))} disabled={pending || !name} className="flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-canvas disabled:opacity-50">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ItemRow({ categoryId, item }: { categoryId: string; item: Item | null }) {
  const isNew = !item;
  const [nameEn, setNameEn] = useState(item?.name.en ?? "");
  const [nameFr, setNameFr] = useState(item?.name.fr ?? "");
  const [price, setPrice] = useState(((item?.priceCents ?? 0) / 100).toString());
  const [pending, start] = useTransition();

  function save() {
    start(() => upsertBuilderItem({ id: item?.id, categoryId, nameEn, nameFr, priceCents: Math.round(parseFloat(price) * 100) || 0, active: true })
      .then(() => { if (isNew) { setNameEn(""); setNameFr(""); setPrice("0"); } }));
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-line p-2">
      <ImageIcon className="h-4 w-4 shrink-0 text-line-strong" />
      <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Item (EN)" className="field !py-1.5 text-sm" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="$" className="field w-20 !py-1.5 text-sm" />
      <button onClick={save} disabled={pending || !nameEn} className="shrink-0 rounded-full bg-ink px-2.5 py-1.5 text-xs font-semibold text-canvas disabled:opacity-50">
        {isNew ? <Plus className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
      </button>
      {!isNew && item && <button onClick={() => start(() => deleteBuilderItem(item.id))} className="shrink-0 text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>}
    </div>
  );
}
