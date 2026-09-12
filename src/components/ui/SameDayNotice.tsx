"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { CLIENT_SETTINGS } from "@/lib/settings-client";
import { cn } from "@/lib/utils";

/**
 * Live same-day delivery promise for the GTA, computed in Toronto time.
 * Renders nothing until mounted to avoid hydration mismatches.
 */
export function SameDayNotice({ className, compact = false }: { className?: string; compact?: boolean }) {
  const t = useTranslations("pdp");
  const [state, setState] = useState<{ before: boolean; label: string } | null>(null);

  useEffect(() => {
    function compute() {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
      const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
      const [ch, cm] = CLIENT_SETTINGS.sameDayCutoff.split(":").map(Number);
      const minutesLeft = ch * 60 + cm - (h * 60 + m);
      if (minutesLeft > 0) {
        const hh = Math.floor(minutesLeft / 60);
        const mm = minutesLeft % 60;
        const label = hh > 0 ? `${hh}h ${mm.toString().padStart(2, "0")}m` : `${mm}m`;
        setState({ before: true, label });
      } else {
        setState({ before: false, label: "" });
      }
    }
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!state) return <span className={cn("block h-5", className)} aria-hidden />;

  return (
    <p className={cn("flex items-start gap-2 text-sm text-ink-soft", compact && "text-xs", className)}>
      <Clock className={cn("mt-0.5 h-4 w-4 shrink-0 text-violet", compact && "h-3.5 w-3.5")} strokeWidth={1.6} />
      <span>
        {state.before ? (
          t.rich("sameDayLeft", {
            time: state.label,
            b: (chunks) => <strong className="font-semibold text-ink">{chunks}</strong>,
          })
        ) : (
          t("sameDayNext")
        )}
      </span>
    </p>
  );
}
