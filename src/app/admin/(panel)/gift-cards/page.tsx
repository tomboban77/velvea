import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Card, Badge } from "@/components/admin/ui";
import { formatMoney, formatDate } from "@/lib/utils";
import { GIFT_CARDS_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  // Paused alongside the storefront gift-card page — see src/lib/features.ts.
  if (!GIFT_CARDS_ENABLED) notFound();

  let cards;
  try {
    cards = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  } catch {
    cards = null;
  }
  return (
    <>
      <PageHeader title="Gift Cards" subtitle="Issued digital gift cards and balances." />
      {!cards ? (
        <EmptyState title="Database not connected" />
      ) : cards.length === 0 ? (
        <EmptyState
          title="No gift cards yet"
          description="Gift cards purchased by customers will appear here with their balances."
        />
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Balance</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cards.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 font-mono text-ink">{c.code}</td>
                  <td className="py-2.5">{formatMoney(c.balanceCents)} / {formatMoney(c.initialCents)}</td>
                  <td className="py-2.5"><Badge tone={c.active ? "green" : "gray"}>{c.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="py-2.5 text-muted">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
