"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PENDING", "PAID", "PROCESSING", "FULFILLED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

export function OrderStatusControl({ id, current }: { id: string; current: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next: OrderStatus) {
    setStatus(next);
    start(async () => {
      await updateOrderStatus(id, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => save(e.target.value as OrderStatus)}
        className="field w-full"
        disabled={pending}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      {saved && <span className="text-xs text-success">Saved</span>}
    </div>
  );
}
