"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  url: string;
  publicId?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export function ImageUploader({
  images,
  onChange,
  folder = "velvea/products",
  max = 8,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const next = [...images];
    for (const file of Array.from(files)) {
      if (next.length >= max) break;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed");
          continue;
        }
        next.push({
          url: data.url,
          publicId: data.publicId,
          width: data.width,
          height: data.height,
          alt: "",
        });
      } catch {
        setError("Upload failed. Check your connection.");
      }
    }
    onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.url + i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) reorder(dragIndex, i);
              setDragIndex(null);
            }}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border border-line bg-cream",
              dragIndex === i && "opacity-50"
            )}
          >
            <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[0.6rem] font-semibold text-canvas">
                <Star className="h-2.5 w-2.5 fill-gold text-gold" /> Cover
              </span>
            )}
            <div className="absolute inset-x-0 top-0 flex justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-4 w-4 cursor-grab text-white drop-shadow" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-cream/40 text-muted transition-colors hover:border-gold hover:text-gold"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading…" : "Add image"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <p className="mt-2 text-xs text-muted">
        First image is the cover. Drag to reorder. Up to {max} images, 8MB each.
      </p>
    </div>
  );
}
