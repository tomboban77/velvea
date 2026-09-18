"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";
import { actionErrorMessage } from "@/lib/action-error";

export function DeleteProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">
          {error ? <span className="text-danger">{error}</span> : "Delete permanently?"}
        </span>
        <button
          onClick={() =>
            start(async () => {
              setError(null);
              try {
                const result = await deleteProduct(id);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
              } catch (e) {
                setError(actionErrorMessage(e));
                return;
              }
              router.push("/admin/products");
              router.refresh();
            })
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
        <button onClick={() => setConfirming(false)} className="text-sm text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-danger hover:text-danger"
    >
      <Trash2 className="h-3.5 w-3.5" /> Delete
    </button>
  );
}
