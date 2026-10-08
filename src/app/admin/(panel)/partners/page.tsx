import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { InquiryStatusControl } from "@/components/admin/InquiryStatusControl";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Handshake, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

const tone = { NEW: "amber", CONTACTED: "iris", QUOTED: "iris", WON: "green", LOST: "gray" } as const;

/** Brands type anything into "website"; only link it when it is a real http(s) URL. */
function safeUrl(value: string): string | null {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.hostname.includes(".") ? url.href : null;
  } catch {
    return null;
  }
}

export default async function BrandPartnersPage() {
  let inquiries;
  try {
    inquiries = await prisma.brandPartnerInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    inquiries = null;
  }

  return (
    <>
      <PageHeader
        title="Brand Partners"
        subtitle="Makers asking to have their products in our baskets (the /partners form). No alcohol; food needs bilingual CFIA labels."
      />
      {!inquiries ? (
        <EmptyState title="Database not connected" />
      ) : inquiries.length === 0 ? (
        <EmptyState title="No brand enquiries yet" description="Submissions from the Sell with Velvéa page will appear here." />
      ) : (
        <div className="space-y-4">
          {inquiries.map((q) => {
            const href = q.website ? safeUrl(q.website) : null;
            return (
              <Card key={q.id} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Handshake className="h-4 w-4 text-violet" />
                    <span className="font-semibold text-ink">{q.brand}</span>
                    <Badge tone={tone[q.status]}>{q.status}</Badge>
                    {q.locale === "fr" && <Badge tone="gray">FR</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{q.contactName}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                    <a href={`mailto:${q.email}`} className="flex items-center gap-1 hover:text-violet"><Mail className="h-3.5 w-3.5" /> {q.email}</a>
                    {q.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {q.phone}</span>}
                    {q.website &&
                      (href ? (
                        <a href={href} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1 hover:text-violet">
                          <Globe className="h-3.5 w-3.5" /> {q.website}
                        </a>
                      ) : (
                        <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {q.website}</span>
                      ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                    {q.category && <span>Makes: <span className="text-ink-soft">{q.category}</span></span>}
                    {q.location && <span>Based in: <span className="text-ink-soft">{q.location}</span></span>}
                    {q.pricing && <span>Wholesale: <span className="text-ink-soft">{q.pricing}</span></span>}
                    <span>Received {formatDate(q.createdAt)}</span>
                  </div>
                  {q.message && (
                    <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-cream/60 px-4 py-2.5 text-sm text-ink-soft">{q.message}</p>
                  )}
                </div>
                <InquiryStatusControl id={q.id} current={q.status} kind="brand" />
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
