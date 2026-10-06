import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { InquiryStatusControl } from "@/components/admin/InquiryStatusControl";
import { formatDate, formatMoney } from "@/lib/utils";
import { formatStoreDate } from "@/lib/dates";
import { Mail, Phone, MessageSquareText, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

const tone = { NEW: "amber", CONTACTED: "iris", QUOTED: "iris", WON: "green", LOST: "gray" } as const;

/** Digits and a leading + only: what tel: and sms: links expect. */
const dialable = (phone: string) => phone.replace(/[^\d+]/g, "");

export default async function CustomRequestsPage() {
  let requests;
  try {
    requests = await prisma.customBasketRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: { select: { slug: true, priceCents: true } } },
    });
  } catch {
    requests = null;
  }

  return (
    <>
      <PageHeader
        title="Custom Basket Requests"
        subtitle="Customers describe the basket they want; reply with a quote by email or phone."
      />
      {!requests ? (
        <EmptyState title="Database not connected" />
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" description="Requests from the custom basket form will appear here." />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <MessageSquareText className="h-4 w-4 text-violet" />
                  <span className="font-semibold text-ink">{r.name}</span>
                  <Badge tone={tone[r.status]}>{r.status}</Badge>
                  {r.locale === "fr" && <Badge tone="gray">FR</Badge>}
                </div>
                {r.productName && (
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
                    <ShoppingBag className="h-3.5 w-3.5 text-violet" />
                    About basket:
                    {r.product ? (
                      <a href={`/products/${r.product.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-ink hover:text-violet">
                        {r.productName}
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{r.productName}</span>
                    )}
                    {r.productPriceCents !== null && <span>({formatMoney(r.productPriceCents)} when asked)</span>}
                    {r.product && r.productPriceCents !== null && r.product.priceCents !== r.productPriceCents && (
                      <span className="text-xs text-muted">· now {formatMoney(r.product.priceCents)}</span>
                    )}
                    {!r.product && <span className="text-xs text-muted">· no longer in the catalogue</span>}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-violet">
                      <Mail className="h-3.5 w-3.5" /> {r.email}
                    </a>
                  )}
                  {r.phone && (
                    <>
                      <a href={`tel:${dialable(r.phone)}`} className="flex items-center gap-1 hover:text-violet">
                        <Phone className="h-3.5 w-3.5" /> {r.phone}
                      </a>
                      <a href={`sms:${dialable(r.phone)}`} className="hover:text-violet">Text</a>
                    </>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                  {r.occasion && <span>Occasion: <span className="text-ink-soft">{r.occasion}</span></span>}
                  {r.budget && <span>Budget: <span className="text-ink-soft">{r.budget}</span></span>}
                  {r.neededBy && <span>Needed by: <span className="text-ink-soft">{formatStoreDate(r.neededBy)}</span></span>}
                  {r.deliveryArea && <span>Delivery: <span className="text-ink-soft">{r.deliveryArea}</span></span>}
                  <span>Received {formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-cream/60 px-4 py-2.5 text-sm text-ink-soft">
                  {r.products}
                </p>
              </div>
              <InquiryStatusControl id={r.id} current={r.status} kind="custom" />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
