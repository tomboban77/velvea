import { PageHeader } from "@/components/admin/ui";
import { HomepageForm, type PickableProduct } from "@/components/admin/HomepageForm";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n-content";
import { HIDDEN_PRODUCT_SLUGS } from "@/lib/features";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const [settings, rows] = await Promise.all([
    getSettings(),
    prisma.product
      .findMany({
        where: {
          status: "ACTIVE",
          ...(HIDDEN_PRODUCT_SLUGS.length ? { slug: { notIn: HIDDEN_PRODUCT_SLUGS } } : {}),
        },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          priceCents: true,
          bestseller: true,
          images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        },
      })
      .catch(() => []),
  ]);

  const products: PickableProduct[] = rows.map((p) => ({
    id: p.id,
    name: t(p.name, "en"),
    priceCents: p.priceCents,
    bestseller: p.bestseller,
    image: p.images[0]?.url ?? null,
  }));

  return (
    <>
      <PageHeader
        title="Homepage"
        subtitle="Choose the five baskets on the hero shelf, which one takes the centre, and how many baskets the collection section shows."
      />
      <HomepageForm initial={settings.home} products={products} />
    </>
  );
}
