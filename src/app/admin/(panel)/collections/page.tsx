import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { CollectionsManager } from "@/components/admin/CollectionsManager";

export const dynamic = "force-dynamic";

const asL = (v: unknown) => {
  const o = (v ?? {}) as Record<string, string>;
  return { en: o.en ?? "", fr: o.fr ?? "" };
};

export default async function CollectionsPage() {
  let rows;
  try {
    const collections = await prisma.collection.findMany({
      orderBy: [{ type: "asc" }, { position: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    rows = collections.map((c) => ({
      id: c.id,
      type: c.type,
      slug: c.slug,
      name: asL(c.name),
      description: asL(c.description),
      imageUrl: c.imageUrl,
      imagePublicId: c.imagePublicId,
      featured: c.featured,
      position: c.position,
      count: c._count.products,
    }));
  } catch {
    rows = null;
  }

  return (
    <>
      <PageHeader title="Collections" subtitle="Occasions, recipients and categories. Add images and descriptions." />
      {rows === null ? (
        <EmptyState title="Database not connected" />
      ) : (
        <CollectionsManager initial={rows} />
      )}
    </>
  );
}
