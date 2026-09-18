import { getLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "./ProductCard";
import { toProductView } from "@/lib/view";
import type { ProductCard as ProductCardType } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function ProductRail({
  products,
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
  tone = "light",
}: {
  products: ProductCardType[];
  eyebrow?: string;
  title: string;
  lede?: string;
  link?: string;
  linkLabel?: string;
  tone?: "light" | "cream";
}) {
  if (!products.length) return null;
  const locale = await getLocale();
  const views = products.map((p) => toProductView(p, locale));

  return (
    <section className={cn("section border-t border-line", tone === "cream" && "band-cream")}>
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} lede={lede} link={link} linkLabel={linkLabel} />
        <div className="grid-products mt-8">
          {views.map((v) => (
            <ProductCard key={v.id} product={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
