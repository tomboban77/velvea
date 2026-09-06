import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { BuilderManager } from "@/components/admin/BuilderManager";

export const dynamic = "force-dynamic";

const asL = (v: unknown) => {
  const o = (v ?? {}) as Record<string, string>;
  return { en: o.en ?? "", fr: o.fr ?? "" };
};

export default async function BuilderPage() {
  let containers, categories;
  try {
    [containers, categories] = await Promise.all([
      prisma.builderContainer.findMany({ orderBy: { position: "asc" } }),
      prisma.builderItemCategory.findMany({ orderBy: { position: "asc" }, include: { items: { orderBy: { position: "asc" } } } }),
    ]);
  } catch {
    return (
      <>
        <PageHeader title="Custom Builder" />
        <EmptyState title="Database not connected" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Custom Builder" subtitle="Manage containers and add-on items for build-your-own baskets." />
      <BuilderManager
        containers={containers.map((c) => ({ id: c.id, name: asL(c.name), priceCents: c.priceCents, imageUrl: c.imageUrl, imagePublicId: c.imagePublicId, capacity: c.capacity, active: c.active }))}
        categories={categories.map((cat) => ({ id: cat.id, name: asL(cat.name), items: cat.items.map((i) => ({ id: i.id, name: asL(i.name), priceCents: i.priceCents, imageUrl: i.imageUrl, imagePublicId: i.imagePublicId, active: i.active })) }))}
      />
    </>
  );
}
