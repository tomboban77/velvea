import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { formatDate } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

const tone = { PENDING: "amber", APPROVED: "green", REJECTED: "gray" } as const;

export default async function ReviewsPage() {
  let reviews;
  try {
    reviews = await prisma.review.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { product: { select: { name: true, slug: true } } },
    });
  } catch {
    reviews = null;
  }

  const pending = reviews?.filter((r) => r.status === "PENDING").length ?? 0;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={pending ? `${pending} awaiting moderation` : "Moderate customer reviews."}
      />

      {!reviews ? (
        <EmptyState title="Database not connected" />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Customer reviews will appear here for approval." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex text-violet">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Badge tone={tone[r.status]}>{r.status}</Badge>
                  {r.verified && <Badge tone="iris">Verified</Badge>}
                </div>
                {r.title && <p className="mt-2 font-display text-lg">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-soft">&ldquo;{r.body}&rdquo;</p>
                <p className="mt-2 text-xs text-muted">
                  {r.authorName}{r.authorLocation ? ` · ${r.authorLocation}` : ""} · on{" "}
                  <span className="font-medium">{t(r.product?.name, "en")}</span> · {formatDate(r.createdAt)}
                </p>
              </div>
              <ReviewActions id={r.id} status={r.status} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
