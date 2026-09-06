"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronDown, Loader2, Save, Plus, Trash2, ImageIcon } from "lucide-react";
import { Card, Badge } from "./ui";
import { Field, TextInput, LocalizedInput, Toggle, Select } from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { upsertCollection, deleteCollection } from "@/lib/actions/admin";
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
  count: number;
};

export function CollectionsManager({ initial }: { initial: CollectionRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const groups = (["OCCASION", "RECIPIENT", "CATEGORY", "THEME"] as const).map((type) => ({
    type,
    rows: initial.filter((c) => c.type === type),
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => setCreating((c) => !c)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal">
          <Plus className="h-4 w-4" /> New collection
        </button>
      </div>

      {creating && (
        <Editor
          row={{ id: "", type: "OCCASION", slug: "", name: { en: "", fr: "" }, description: { en: "", fr: "" }, imageUrl: null, imagePublicId: null, featured: false, position: 0, count: 0 }}
          onDone={() => setCreating(false)}
          isNew
        />
      )}

      {groups.map((g) =>
        g.rows.length ? (
          <div key={g.type}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{g.type.toLowerCase()}</h2>
            <div className="space-y-2">
              {g.rows.map((row) => (
                <Card key={row.id} className="!p-0 overflow-hidden">
                  <button onClick={() => setOpen(open === row.id ? null : row.id)} className="flex w-full items-center gap-4 p-4 text-left">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {row.imageUrl ? (
                        <Image src={row.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><ImageIcon className="h-4 w-4 text-line-strong" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink">{row.name.en}</p>
                      <p className="text-xs text-muted">/{row.slug} · {row.count} products</p>
                    </div>
                    {row.featured && <Badge tone="iris">Featured</Badge>}
                    <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open === row.id && "rotate-180")} />
                  </button>
                  {open === row.id && (
                    <div className="border-t border-line p-4">
                      <Editor row={row} onDone={() => setOpen(null)} />
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
