import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { FilterBar } from "./FilterBar";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyBaskets } from "./EmptyBaskets";
import { toProductView } from "@/lib/view";
import { OCCASIONS, labelFor } from "@/lib/nav";
import type { ProductCard as ProductCardType } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function Listing({
  eyebrow,
  title,
  description,
  products,
  total,
  breadcrumb,
  showOccasions = false,
  activeSlug,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: ProductCardType[];
  total: number;
  breadcrumb: { label: string; href: string }[];
  /** show an occasion browse strip under the header (used on /baskets and occasion pages) */
  showOccasions?: boolean;
  activeSlug?: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations("listing");
  const views = products.map((p) => toProductView(p, locale));
  const few = views.length > 0 && views.length <= 3;

  return (
    <div className="container-x pb-16 pt-6 lg:pt-8">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        {breadcrumb.map((b, i) => (
          <span key={b.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" strokeWidth={1.6} />}
            {i === breadcrumb.length - 1 ? (
              <span className="text-ink-soft">{b.label}</span>
            ) : (
              <Link href={b.href} className="hover:text-violet">
                {b.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <header className="max-w-2xl">
        {eyebrow && <p className="chapter mb-4">{eyebrow}</p>}
        <h1 className="h-section font-display balance">{title}</h1>
        {description && <p className="mt-4 text-[1.02rem] text-ink-soft pretty">{description}</p>}
      </header>

      {showOccasions && (
        <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="mr-1 shrink-0 text-[0.62rem] uppercase tracking-[0.24em] text-muted">{t("browse")}</span>
          <Link href="/baskets" className={cn("chip", !activeSlug && "is-active")}>
            {t("allTitle")}
          </Link>
          {OCCASIONS.map((o) => (
            <Link key={o.slug} href={`/occasions/${o.slug}`} className={cn("chip", activeSlug === o.slug && "is-active")}>
              {labelFor(o, locale)}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        {views.length > 0 ? (
          <>
            <FilterBar total={total} />
            <div className={cn("mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6", few ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4")}>
              {views.map((v, i) => (
                <Reveal key={v.id} delay={(i % 8) * 50}>
                  <ProductCard product={v} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <EmptyBaskets />
        )}
      </div>
    </div>
  );
}
