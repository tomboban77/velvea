import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { DiscountsManager } from "@/components/admin/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  let discounts;
  try {
    discounts = await prisma.discountCode.findMany({ orderBy: { code: "asc" } });
  } catch {
    discounts = null;
  }
  return (
    <>
      <PageHeader title="Discounts" subtitle="Create and manage discount codes." />
      {discounts === null ? (
        <EmptyState title="Database not connected" />
      ) : (
        <DiscountsManager initial={discounts} />
      )}
    </>
  );
}
