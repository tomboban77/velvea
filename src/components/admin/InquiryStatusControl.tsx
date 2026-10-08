"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateInquiryStatus, updateCustomRequestStatus, updateBrandPartnerStatus } from "@/lib/actions/admin";
import type { InquiryStatus } from "@prisma/client";

const STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];

/** Brands go through the same enum; these names say what each stage means for a supplier. */
const BRAND_LABELS: Record<InquiryStatus, string> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUOTED: "SAMPLES / TERMS",
  WON: "ONBOARDED",
  LOST: "DECLINED",
};

export function InquiryStatusControl({
  id,
  current,
  kind = "corporate",
}: {
  id: string;
  current: InquiryStatus;
  /** Which inbox the row belongs to. All share the same status pipeline. */
  kind?: "corporate" | "custom" | "brand";
}) {
  const update =
    kind === "custom" ? updateCustomRequestStatus : kind === "brand" ? updateBrandPartnerStatus : updateInquiryStatus;
  const [status, setStatus] = useState(current);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => {
          const next = e.target.value as InquiryStatus;
          setStatus(next);
          start(() => update({ id, status: next }));
        }}
        className="field w-40"
        disabled={pending}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{kind === "brand" ? BRAND_LABELS[s] : s}</option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
    </div>
  );
}
