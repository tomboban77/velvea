"use client";

import { useTransition } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { moderateReview, deleteReview } from "@/lib/actions/admin";
import type { ReviewStatus } from "@prisma/client";

export function ReviewActions({ id, status }: { id: string; status: ReviewStatus }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      {status !== "APPROVED" && (
        <button
          onClick={() => start(() => moderateReview(id, "APPROVED"))}
          className="flex items-center gap-1 rounded-full bg-success/12 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={() => start(() => moderateReview(id, "REJECTED"))}
          className="flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-line-strong"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      )}
      <button
        onClick={() => start(() => deleteReview(id))}
        className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-muted hover:text-danger"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
