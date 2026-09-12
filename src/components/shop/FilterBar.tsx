"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import { formatMoney, cn } from "@/lib/utils";

const PRICE_STEPS = [7500, 12500, 20000];

/** Price chips + sort, driven by URL params (`max`, `sort`). */
export function FilterBar({ total }: { total: number }) {
  const t = useTranslations("listing");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = useLocale();
  const currentSort = params.get("sort") ?? "featured";
  const currentMax = params.get("max") ?? "";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "featured") sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const money = (c: number) => formatMoney(c, locale === "fr" ? "fr-CA" : "en-CA").replace(/[.,]00/, "");

  return (
    <div className="flex flex-col gap-4 border-y border-line-strong py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="caps mr-1 shrink-0 text-[0.58rem] text-muted">{t("price")}</span>
        <button onClick={() => update({ max: null })} className={cn("chip", !currentMax && "is-active")}>
          {t("priceAll")}
        </button>
        {PRICE_STEPS.map((p) => (
          <button key={p} onClick={() => update({ max: String(p) })} className={cn("chip", currentMax === String(p) && "is-active")}>
            {t("under", { amount: money(p) })}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <span className="text-sm text-muted">{total === 1 ? t("result", { count: total }) : t("results", { count: total })}</span>
        <div className="flex items-center gap-3">
          <span className="caps text-[0.58rem] text-muted">{t("sort")}</span>
          <Select
            value={currentSort}
            onChange={(v) => update({ sort: v })}
            ariaLabel={t("sort")}
            align="right"
            options={[
              { value: "featured", label: t("featured") },
              { value: "price-asc", label: t("priceAsc") },
              { value: "price-desc", label: t("priceDesc") },
              { value: "rating", label: t("rating") },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
