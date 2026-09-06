"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = useLocale();
  const current = params.get("sort") ?? "featured";

  const labels =
    locale === "fr"
      ? {
          count: `${total} paniers`,
          featured: "En vedette",
          "price-asc": "Prix croissant",
          "price-desc": "Prix décroissant",
          rating: "Les mieux notés",
          sort: "Trier",
        }
      : {
          count: `${total} baskets`,
          featured: "Featured",
          "price-asc": "Price: low to high",
          "price-desc": "Price: high to low",
          rating: "Top rated",
          sort: "Sort",
        };

  function change(sort: string) {
    const sp = new URLSearchParams(params.toString());
    if (sort === "featured") sp.delete("sort");
    else sp.set("sort", sort);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
      <span className="text-sm text-muted">{labels.count}</span>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">{labels.sort}:</span>
        <select
          value={current}
          onChange={(e) => change(e.target.value)}
          className="rounded-full border border-line-strong bg-shell px-3 py-1.5 text-sm font-medium text-ink focus:border-gold-soft focus:outline-none"
        >
          <option value="featured">{labels.featured}</option>
          <option value="price-asc">{labels["price-asc"]}</option>
          <option value="price-desc">{labels["price-desc"]}</option>
          <option value="rating">{labels.rating}</option>
        </select>
      </label>
    </div>
  );
}
