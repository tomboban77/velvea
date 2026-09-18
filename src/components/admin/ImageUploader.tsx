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

/** Must stay at or below the limit in /api/admin/upload. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_EDGE = 2400;

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/**
 * Phone photos routinely run past the upload limit, which used to surface as
 * a bare "upload failed". Re-encode them in the browser instead; Cloudinary
 * serves a transformed copy anyway, so nothing is lost at display size.
 */
async function downscale(file: File): Promise<File | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    for (const quality of [0.85, 0.7, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
    return null;
  } catch {
    // HEIC and other formats the browser can't decode land here.
    return null;
  }
}

function uploadErrorMessage(status: number, serverError?: string): string {
  if (status === 401) {
    return "Your admin session expired. Sign in again in another tab, then re-add the image.";
  }
  if (status === 413) return `Image too large — the limit is ${mb(MAX_UPLOAD_BYTES)}MB.`;
  return serverError || `Upload failed (${status}).`;
}

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
    for (const original of Array.from(files)) {
      if (next.length >= max) break;

      let file = original;
      if (file.size > MAX_UPLOAD_BYTES) {
        const smaller = await downscale(file);
        if (!smaller) {
          setError(
            `${original.name} is ${mb(original.size)}MB and couldn't be resized here. ` +
              `Save it as a JPEG under ${mb(MAX_UPLOAD_BYTES)}MB and try again.`
          );
          continue;
        }
        file = smaller;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        // A rejection from the platform (size, auth redirect) is not JSON, so
        // parsing has to be allowed to fail without losing the status code.
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(uploadErrorMessage(res.status, data?.error));
          continue;
        }
        if (!data?.url) {
          setError("The image uploaded but no URL came back. Try again.");
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
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-cream/40 text-muted transition-colors hover:border-violet hover:text-violet"
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
        First image is the cover. Drag to reorder. Up to {max} images. Anything over{" "}
        {mb(MAX_UPLOAD_BYTES)}MB is resized automatically before it uploads.
      </p>
    </div>
  );
}
