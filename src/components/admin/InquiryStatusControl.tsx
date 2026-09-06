"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateInquiryStatus } from "@/lib/actions/admin";
import type { InquiryStatus } from "@prisma/client";

const STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];

export function InquiryStatusControl({ id, current }: { id: string; current: InquiryStatus }) {
  const [status, setStatus] = useState(current);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => {
          const next = e.target.value as InquiryStatus;
          setStatus(next);
          start(() => updateInquiryStatus(id, next));
        }}
        className="field w-40"
        disabled={pending}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
    </div>
  );
}
