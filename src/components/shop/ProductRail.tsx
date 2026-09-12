import { getLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";
import { toProductView } from "@/lib/view";
import type { ProductCard as ProductCardType } from "@/lib/queries";

export async function ProductRail({
  products,
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
}: {
  products: ProductCardType[];
  eyebrow?: string;
  title: string;
  lede?: string;
  link?: string;
  linkLabel?: string;
}) {
  if (!products.length) return null;
  const locale = await getLocale();
  const views = products.map((p) => toProductView(p, locale));

  return (
    <section className="container-x section">
      <SectionHeading eyebrow={eyebrow} title={title} lede={lede} link={link} linkLabel={linkLabel} />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
        {views.map((v, i) => (
          <Reveal key={v.id} delay={i * 60}>
            <ProductCard product={v} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
