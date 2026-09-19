import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { DeliveryZonesManager, type ZoneRow } from "@/components/admin/DeliveryZonesManager";

export const dynamic = "force-dynamic";

export default async function DeliveryZonesPage() {
  let zones: ZoneRow[] | null;
  try {
    const rows = await prisma.deliveryZone.findMany({
      orderBy: [{ position: "asc" }, { key: "asc" }],
    });
    zones = rows.map((z) => ({
      ...z,
      name: (z.name ?? { en: z.key, fr: z.key }) as { en: string; fr: string },
    }));
  } catch {
    zones = null;
  }
  return (
    <>
      <PageHeader
        title="Delivery zones"
        subtitle="Where we deliver, what it costs and how soon. Destinations are matched on postal code, never on the city a customer types."
      />
      {zones === null ? (
        <EmptyState title="Database not connected" />
      ) : (
        <DeliveryZonesManager initial={zones} />
      )}
    </>
  );
}
