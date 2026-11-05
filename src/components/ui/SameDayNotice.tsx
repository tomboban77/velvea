"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_TIMEZONE, cutoffMinutes, storeMinutesOfDay } from "@/lib/dates";

/**
 * Live same-day countdown, computed in Toronto time.
 *
 * The cutoff is passed in rather than read from a constant: it belongs to a
 * delivery zone now, and this component is rendered on pages that do not yet
 * know the recipient's address. Callers pass the home zone's cutoff, which is
 * the promise we can always keep.
 *
 * `orderCutoff` is the daily production cutoff (settings `delivery.orderCutoff`).
 * Between the same-day cutoff and it, next-day is still on offer; after it the
 * order starts its lead time tomorrow, so "order now for next-day" would be a
 * promise checkout then refuses.
 */
export function SameDayNotice({
  cutoff,
  orderCutoff,
  className,
  compact = false,
}: {
  cutoff: string;
  orderCutoff: string;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("pdp");
  const [state, setState] = useState<{
    phase: "same-day" | "next-day" | "later";
    label: string;
    weekend: boolean;
  } | null>(null);

  useEffect(() => {
    function compute() {
      const now = new Date();
      const nowMin = storeMinutesOfDay(now);
      // Weekday runs go out 7 to 11 pm; weekends are spread through the day.
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TIMEZONE, weekday: "short" }).format(now);
      const weekend = day.startsWith("Sat") || day.startsWith("Sun");
      const minutesLeft = cutoffMinutes(cutoff) - nowMin;
      if (minutesLeft > 0) {
        const hh = Math.floor(minutesLeft / 60);
        const mm = minutesLeft % 60;
        const label = hh > 0 ? `${hh}h ${mm.toString().padStart(2, "0")}m` : `${mm}m`;
        setState({ phase: "same-day", label, weekend });
      } else if (nowMin < cutoffMinutes(orderCutoff)) {
        setState({ phase: "next-day", label: "", weekend });
      } else {
        setState({ phase: "later", label: "", weekend });
      }
    }
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [cutoff, orderCutoff]);

  if (!state) return <span className={cn("block h-5", className)} aria-hidden />;

  return (
    <p className={cn("flex items-start gap-2 text-sm text-ink-soft", compact && "text-xs", className)}>
      <Clock className={cn("mt-0.5 h-4 w-4 shrink-0 text-violet", compact && "h-3.5 w-3.5")} strokeWidth={1.6} />
      <span>
        {state.phase === "same-day" ? (
          t.rich("sameDayLeft", {
            time: state.label,
            window: t(state.weekend ? "sameDayWeekend" : "sameDayWeekday"),
            b: (chunks) => <strong className="font-semibold text-ink">{chunks}</strong>,
          })
        ) : state.phase === "next-day" ? (
          t("sameDayNext")
        ) : (
          t("sameDayAfterCutoff")
        )}
      </span>
    </p>
  );
}
