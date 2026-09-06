import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SortBar } from "./SortBar";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyBaskets } from "./EmptyBaskets";
import { toProductView } from "@/lib/view";
import type { ProductCard as ProductCardType } from "@/lib/queries";

export async function Listing({
  eyebrow,
  title,
  description,
  products,
  total,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: ProductCardType[];
  total: number;
  breadcrumb: { label: string; href: string }[];
}) {
  const locale = await getLocale();
  const views = products.map((p) => toProductView(p, locale));

  return (
    <div className="container-x py-10">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        {breadcrumb.map((b, i) => (
          <span key={b.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i === breadcrumb.length - 1 ? (
              <span className="text-ink-soft">{b.label}</span>
            ) : (
              <Link href={b.href} className="hover:text-gold">
                {b.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-8 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-ink-soft">{description}</p>}
      </header>

      {views.length > 0 ? (
        <>
          <SortBar total={total} />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {views.map((v, i) => (
              <Reveal key={v.id} delay={(i % 8) * 50}>
                <ProductCard product={v} />
              </Reveal>
            ))}
          </div>
        </>
      ) : (
        <EmptyBaskets />
      )}
    </div>
  );
}
