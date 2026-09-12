import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { InquiryStatusControl } from "@/components/admin/InquiryStatusControl";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

const tone = { NEW: "amber", CONTACTED: "iris", QUOTED: "iris", WON: "green", LOST: "gray" } as const;

export default async function InquiriesPage() {
  let inquiries;
  try {
    inquiries = await prisma.corporateInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    inquiries = null;
  }

  return (
    <>
      <PageHeader title="Corporate Inquiries" subtitle="Quote requests from businesses." />
      {!inquiries ? (
        <EmptyState title="Database not connected" />
      ) : inquiries.length === 0 ? (
        <EmptyState title="No inquiries yet" description="Corporate quote requests will appear here." />
      ) : (
        <div className="space-y-4">
          {inquiries.map((q) => (
            <Card key={q.id} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-violet" />
                  <span className="font-semibold text-ink">{q.company}</span>
                  <Badge tone={tone[q.status]}>{q.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{q.contactName}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                  <a href={`mailto:${q.email}`} className="flex items-center gap-1 hover:text-violet"><Mail className="h-3.5 w-3.5" /> {q.email}</a>
                  {q.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {q.phone}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                  {q.quantity && <span>Qty: <span className="text-ink-soft">{q.quantity}</span></span>}
                  {q.budget && <span>Budget: <span className="text-ink-soft">{q.budget}</span></span>}
                  {q.occasion && <span>Occasion: <span className="text-ink-soft">{q.occasion}</span></span>}
                  <span>{formatDate(q.createdAt)}</span>
                </div>
                {q.message && <p className="mt-3 rounded-xl bg-cream/60 px-4 py-2.5 text-sm text-ink-soft">{q.message}</p>}
              </div>
              <InquiryStatusControl id={q.id} current={q.status} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
