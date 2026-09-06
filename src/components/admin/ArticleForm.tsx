"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Card } from "./ui";
import { Field, TextInput, LocalizedInput, Select, Toggle } from "./form";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { upsertArticle, deleteArticle } from "@/lib/actions/admin";

type L = { en: string; fr: string };

export type ArticleFormData = {
  id?: string;
  slug: string;
  category: "CORPORATE" | "SYMPATHY" | "OCCASIONS" | "RECIPIENTS" | "SEASONAL" | "ETIQUETTE";
  title: L; excerpt: L; body: L;
  coverImage: string | null;
  coverPublicId: string | null;
  author: string;
  readMinutes: number;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
};

export function emptyArticle(): ArticleFormData {
  return {
    slug: "", category: "OCCASIONS",
    title: { en: "", fr: "" }, excerpt: { en: "", fr: "" }, body: { en: "", fr: "" },
    coverImage: null, coverPublicId: null, author: "The Velvea Team", readMinutes: 4,
    status: "DRAFT", featured: false,
  };
}

export function ArticleForm({ initial }: { initial: ArticleFormData }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [pending, start] = useTransition();
  const [images, setImages] = useState<UploadedImage[]>(
    initial.coverImage ? [{ url: initial.coverImage, publicId: initial.coverPublicId }] : []
  );
  const set = <K extends keyof ArticleFormData>(k: K, v: ArticleFormData[K]) => setD((p) => ({ ...p, [k]: v }));

  function save() {
    start(async () => {
      await upsertArticle({
        id: d.id, slug: d.slug, category: d.category,
        titleEn: d.title.en, titleFr: d.title.fr,
        excerptEn: d.excerpt.en, excerptFr: d.excerpt.fr,
        bodyEn: d.body.en, bodyFr: d.body.fr,
        coverImage: images[0]?.url ?? null, coverPublicId: images[0]?.publicId ?? null,
        author: d.author, readMinutes: d.readMinutes, status: d.status, featured: d.featured,
      });
      router.push("/admin/articles");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/articles" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Gift Guides</Link>
        <div className="flex items-center gap-3">
          {d.id && (
            <button onClick={() => start(async () => { await deleteArticle(d.id!); router.push("/admin/articles"); router.refresh(); })} className="flex items-center gap-1.5 text-sm text-muted hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
          <button onClick={save} disabled={pending} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {d.id ? "Save" : "Create"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5">
            <LocalizedInput label="Title" en={d.title.en} fr={d.title.fr} onEn={(v) => set("title", { ...d.title, en: v })} onFr={(v) => set("title", { ...d.title, fr: v })} />
            <LocalizedInput label="Excerpt" en={d.excerpt.en} fr={d.excerpt.fr} textarea rows={2} onEn={(v) => set("excerpt", { ...d.excerpt, en: v })} onFr={(v) => set("excerpt", { ...d.excerpt, fr: v })} />
            <LocalizedInput label="Body (HTML allowed)" en={d.body.en} fr={d.body.fr} textarea rows={12} onEn={(v) => set("body", { ...d.body, en: v })} onFr={(v) => set("body", { ...d.body, fr: v })} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="space-y-4">
            <Field label="Status">
              <Select value={d.status} onChange={(v) => set("status", v as ArticleFormData["status"])} options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }]} />
            </Field>
            <Field label="Category">
              <Select value={d.category} onChange={(v) => set("category", v as ArticleFormData["category"])} options={["CORPORATE", "SYMPATHY", "OCCASIONS", "RECIPIENTS", "SEASONAL", "ETIQUETTE"].map((c) => ({ value: c, label: c[0] + c.slice(1).toLowerCase() }))} />
            </Field>
            <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Featured" />
          </Card>
          <Card><p className="label">Cover image</p><ImageUploader images={images} onChange={setImages} folder="velvea/articles" max={1} /></Card>
          <Card className="space-y-4">
            <Field label="Author"><TextInput value={d.author} onChange={(v) => set("author", v)} /></Field>
            <Field label="Read minutes"><TextInput type="number" value={String(d.readMinutes)} onChange={(v) => set("readMinutes", parseInt(v) || 4)} /></Field>
            <Field label="Slug" hint="Auto from title if blank."><TextInput value={d.slug} onChange={(v) => set("slug", v)} /></Field>
          </Card>
        </div>
      </div>
    </div>
  );
}
