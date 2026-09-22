import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination with real links, so every product is reachable
 * with JavaScript disabled and crawlers see page 2 as its own URL. Sort and
 * filter params are carried along so paging never resets the visitor's view.
 */
export async function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Current sort/filter params to preserve (page is added here). */
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const t = await getTranslations("listing");

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    else sp.delete("page");
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  // First, last, current ±1; gaps collapse to an ellipsis.
  const wanted = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const items: (number | "gap")[] = [];
  let prev = 0;
  for (const p of [...wanted].sort((a, b) => a - b)) {
    if (p - prev > 1) items.push("gap");
    items.push(p);
    prev = p;
  }

  return (
    <nav aria-label={t("pagination")} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className="chip" aria-label={t("prev")}>
          <ChevronLeft className="h-4 w-4" /> {t("prev")}
        </Link>
      ) : (
        <span className="chip opacity-40" aria-disabled="true"><ChevronLeft className="h-4 w-4" /> {t("prev")}</span>
      )}
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted">…</span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            className={cn("chip min-w-10 justify-center", item === page && "is-active")}
            aria-current={item === page ? "page" : undefined}
            aria-label={t("page", { page: item })}
          >
            {item}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className="chip" aria-label={t("next")}>
          {t("next")} <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="chip opacity-40" aria-disabled="true">{t("next")} <ChevronRight className="h-4 w-4" /></span>
      )}
      <p className="sr-only">{t("pageOf", { page, total: totalPages })}</p>
    </nav>
  );
}
