import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { getCollectionOptions } from "@/lib/admin-data";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

const asL = (v: unknown): { en: string; fr: string } => {
  if (v && typeof v === "object") {
    const o = v as Record<string, string>;
    return { en: o.en ?? "", fr: o.fr ?? "" };
  }
  return { en: "", fr: "" };
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
        collections: true,
      },
    });
  } catch {
    product = null;
  }
  if (!product) notFound();

  const collections = await getCollectionOptions();

  const initial: ProductFormData = {
    id: product.id,
    slug: product.slug,
    name: asL(product.name),
    tagline: asL(product.tagline),
    description: asL(product.description),
    care: asL(product.care),
    contents: Array.isArray(product.contents)
      ? (product.contents as unknown[]).map(asL)
      : [],
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents,
    sku: product.sku ?? "",
    status: product.status,
    featured: product.featured,
    bestseller: product.bestseller,
    badges: product.badges,
    leadTimeDays: product.leadTimeDays,
    weightGrams: product.weightGrams,
    inventory: product.inventory,
    collectionIds: product.collections.map((c) => c.collectionId),
    images: product.images.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt,
      width: img.width,
      height: img.height,
    })),
    variants: product.variants.map((v) => ({
      label: asL(v.label),
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      sku: v.sku ?? "",
    })),
    seoTitle: asL(product.seoTitle),
    seoDescription: asL(product.seoDescription),
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Edit product</h1>
        <DeleteProductButton id={product.id} />
      </div>
      <ProductForm initial={initial} collections={collections} />
    </>
  );
}
