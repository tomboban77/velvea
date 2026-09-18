import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductCard } from "./ProductCard";
import { FilterBar } from "./FilterBar";
import { EmptyBaskets } from "./EmptyBaskets";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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

  return (
    <div>
      {/* header band */}
      <div className="band-cream border-b border-line">
        <div className="container-x pb-8 pt-5 lg:pb-10">
          <Breadcrumb items={breadcrumb} />
          <header className="mt-6 max-w-3xl">
            {eyebrow && <p className="caps mb-3">{eyebrow}</p>}
            <h1 className="h-display balance">{title}</h1>
            {description && <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft pretty">{description}</p>}
          </header>

          {showOccasions && (
            <div className="-mx-[var(--gutter)] mt-7 px-[var(--gutter)]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Link href="/baskets" className={cn("chip", !activeSlug && "is-active")}>
                  {t("all")}
                </Link>
                {OCCASIONS.map((o) => (
                  <Link key={o.slug} href={`/occasions/${o.slug}`} className={cn("chip", activeSlug === o.slug && "is-active")}>
                    {labelFor(o, locale)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-x pb-16 pt-4">
        {views.length > 0 ? (
          <>
            <FilterBar total={total} />
            <div className="grid-products mt-8">
              {views.map((v, i) => (
                <ProductCard key={v.id} product={v} priority={i < 5} />
              ))}
            </div>
          </>
        ) : (
          <div className="pt-6">
            <EmptyBaskets />
          </div>
        )}
      </div>
    </div>
  );
}
