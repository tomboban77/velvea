import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { InquiryStatusControl } from "@/components/admin/InquiryStatusControl";
import { ProfitControl } from "@/components/admin/ProfitControl";
import { formatDate, formatMoney } from "@/lib/utils";
import { formatStoreDate } from "@/lib/dates";
import { Mail, Phone, MessageSquareText, ShoppingBag, Sparkles } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import Image from "next/image";
import { styleFromLabel } from "@/lib/gift-styles";

export const dynamic = "force-dynamic";

const tone = { NEW: "amber", CONTACTED: "iris", QUOTED: "iris", WON: "green", LOST: "gray" } as const;

/** Digits and a leading + only: what tel: and sms: links expect. */
const dialable = (phone: string) => phone.replace(/[^\d+]/g, "");

export default async function CustomRequestsPage() {
  await requireAdminPage("inquiries:write");
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
          {requests.map((r) => {
            const fromStyle = styleFromLabel(r.productName);
            return (
            <Card key={r.id} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <MessageSquareText className="h-4 w-4 text-violet" />
                  <span className="font-semibold text-ink">{r.name}</span>
                  <Badge tone={tone[r.status]}>{r.status}</Badge>
                  {r.locale === "fr" && <Badge tone="gray">FR</Badge>}
                </div>
                {/* A request that started from a gift style keeps the style's code
                    and name in productName; it never had a basket. The photo is
                    shown so there is no guessing which look they picked. */}
                {fromStyle && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-cream/60 p-2.5">
                    {fromStyle.style && (
                      <a href={`/custom-basket?style=${fromStyle.style.slug}`} target="_blank" rel="noreferrer" className="shrink-0">
                        <Image
                          src={fromStyle.style.image.src}
                          alt={fromStyle.name}
                          width={72}
                          height={72}
                          className="h-[72px] w-[72px] rounded-md object-cover"
                        />
                      </a>
                    )}
                    <div className="min-w-0 text-sm text-ink-soft">
                      <p className="flex flex-wrap items-center gap-x-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet" />
                        Gift style
                        <Badge tone="iris">{fromStyle.code}</Badge>
                        <span className="font-semibold text-ink">{fromStyle.name}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Priced by quote
                        {fromStyle.style ? (
                          <>
                            {" · "}
                            <a href={`/custom-basket?style=${fromStyle.style.slug}`} target="_blank" rel="noreferrer" className="hover:text-violet">
                              View the style
                            </a>
                          </>
                        ) : (
                          " · no longer in the style list"
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {r.productName && !fromStyle && (
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
              <div className="w-full shrink-0 space-y-3 lg:w-52">
                <InquiryStatusControl id={r.id} current={r.status} kind="custom" />
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Profit</p>
                  <ProfitControl id={r.id} initialCents={r.profitCents} kind="custom" />
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
