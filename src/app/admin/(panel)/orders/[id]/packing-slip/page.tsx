import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import { formatStoreDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packing slip", robots: { index: false, follow: false } };

/**
 * Printable slip that goes in the box. Deliberately price-free on the item
 * lines — Velvea never includes prices with a gift — but it carries the gift
 * message and delivery notes the packer needs.
 */
export default async function PackingSlip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  try {
    order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  } catch {
    order = null;
  }
  if (!order) notFound();

  const shipping = order.shipping as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
  };

  return (
    <div className="mx-auto max-w-[21cm] bg-white p-10 text-[#211b15] print:p-0">
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 1.5cm; } }`}</style>

      <p className="no-print mb-6 text-right text-sm text-[#8a8072]">
        Print with Ctrl/Cmd + P.
      </p>

      <header className="flex items-start justify-between border-b border-[#e8dfcf] pb-6">
        <div>
          <p className="text-xl font-bold tracking-[4px] text-[#b0894e]">VELVÉA</p>
          <p className="mt-1 text-xs text-[#8a8072]">Mississauga, Ontario · velvea.ca</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-[#8a8072]">{formatDate(order.createdAt)}</p>
          <p className="text-xs text-[#8a8072]">{order.deliveryMethod.replace("_", " ")}</p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8072]">
            Deliver to
          </p>
          <p>
            {shipping.fullName}
            <br />
            {shipping.line1}
            {shipping.line2 ? `, ${shipping.line2}` : ""}
            <br />
            {shipping.city}, {shipping.province} {shipping.postalCode}
            {shipping.phone && (
              <>
                <br />
                {shipping.phone}
              </>
            )}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8a8072]">
            Schedule
          </p>
          <p>
            {order.deliveryDate ? formatStoreDate(order.deliveryDate) : "No preferred date"}
            {order.deliveryNotes && (
              <>
                <br />
                <span className="text-[#514a40]">{order.deliveryNotes}</span>
              </>
            )}
          </p>
        </div>
      </section>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8dfcf] text-left text-xs uppercase tracking-wider text-[#8a8072]">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => {
            const cfg = i.customConfig as {
              containerName?: string;
              items?: { name: string; qty: number }[];
              note?: string;
            } | null;
            return (
              <tr key={i.id} className="border-b border-[#f0e7d6] align-top">
                <td className="py-3">
                  <p className="font-medium">{i.name}</p>
                  {i.variantLabel && <p className="text-xs text-[#8a8072]">{i.variantLabel}</p>}
                  {i.giftMessage && (
                    <div className="mt-2 rounded border border-[#e8dfcf] bg-[#f5efe3] px-3 py-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#8a8072]">
                        Card for this basket
                      </p>
                      <p className="whitespace-pre-wrap text-sm italic">{i.giftMessage}</p>
                    </div>
                  )}
                  {i.isCustom && cfg ? (
                    <div className="text-xs text-[#514a40]">
                      {cfg.containerName && <p>Container: {cfg.containerName}</p>}
                      {cfg.items?.length ? (
                        <ul className="mt-0.5 list-inside list-disc">
                          {cfg.items.map((c, n) => (
                            <li key={n}>
                              {c.name}
                              {c.qty > 1 ? ` × ${c.qty}` : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {cfg.note && <p className="mt-0.5 italic">Note: {cfg.note}</p>}
                    </div>
                  ) : null}
                </td>
                <td className="py-3 text-right font-semibold">{i.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {order.giftMessage && (
        <section className="mt-8 rounded-xl border border-[#e8dfcf] bg-[#f5efe3] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8a8072]">
            {order.items.some((i) => i.giftMessage)
              ? "Card for every other basket"
              : "Handwrite on the card"}
          </p>
          <p className="whitespace-pre-wrap text-base italic">{order.giftMessage}</p>
        </section>
      )}

      <footer className="mt-10 border-t border-[#e8dfcf] pt-4 text-xs text-[#8a8072]">
        <p>
          Prices are never included with a Velvea gift. Order total on file:{" "}
          {formatMoney(order.totalCents)} (office copy only).
        </p>
      </footer>
    </div>
  );
}
