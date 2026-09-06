import { ProductForm } from "@/components/admin/ProductForm";
import { emptyProduct } from "@/lib/admin-forms";
import { getCollectionOptions } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const collections = await getCollectionOptions();
  return (
    <>
      <h1 className="mb-6 font-display text-3xl text-ink">New product</h1>
      <ProductForm initial={emptyProduct()} collections={collections} />
    </>
  );
}
