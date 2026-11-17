"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setOrderProfit, setCustomRequestProfit } from "@/lib/actions/admin";

const toInput = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));

/**
 * Dollars as typed -> integer cents. Empty means "not entered" (null), which is
 * kept apart from 0 so an unfilled order never reads as a break-even one.
 * Returns undefined for anything that is not a plain amount.
 */
function toCents(raw: string): number | null | undefined {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return undefined;
  return Math.round(Number(cleaned) * 100);
}

export function ProfitControl({
  id,
  initialCents,
  kind,
}: {
  id: string;
  initialCents: number | null;
  /** Orders and custom basket requests each store their own profit. */
  kind: "order" | "custom";
}) {
  const router = useRouter();
  const initial = toInput(initialCents);
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const profitCents = toCents(value);
    if (profitCents === undefined) {
      setError("Enter an amount like 24.50, or leave it empty.");
      return;
    }
    setError(null);
    start(async () => {
      try {
        await (kind === "order" ? setOrderProfit : setCustomRequestProfit)({ id, profitCents });
        setValue(toInput(profitCents));
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            $
          </span>
          <input
            inputMode="decimal"
            aria-label="Profit in dollars"
            placeholder="0.00"
            className="field w-full pl-7"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
          />
        </div>
        <button
          type="submit"
          disabled={pending || value.trim() === initial}
          className="btn btn-outline btn-sm shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </button>
      </div>
      {saved && <p className="text-xs text-success">Saved</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
