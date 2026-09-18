import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Card, Badge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  let subs;
  let counts = { confirmed: 0, pending: 0, unsubscribed: 0 };
  try {
    subs = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    const [confirmed, pending, unsubscribed] = await Promise.all([
      prisma.newsletterSubscriber.count({
        where: { confirmedAt: { not: null }, unsubscribedAt: null },
      }),
      prisma.newsletterSubscriber.count({ where: { confirmedAt: null, unsubscribedAt: null } }),
      prisma.newsletterSubscriber.count({ where: { unsubscribedAt: { not: null } } }),
    ]);
    counts = { confirmed, pending, unsubscribed };
  } catch {
    subs = null;
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        subtitle={
          subs
            ? `${counts.confirmed} confirmed · ${counts.pending} awaiting confirmation · ${counts.unsubscribed} unsubscribed`
            : ""
        }
      />
      {!subs ? (
        <EmptyState title="Database not connected" />
      ) : subs.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          description="Newsletter sign-ups from the footer appear here."
        />
      ) : (
        <Card>
          {/* CASL: only confirmed, non-unsubscribed addresses may be mailed. */}
          <p className="mb-4 text-sm text-muted">
            Only <span className="font-semibold text-ink">confirmed</span> subscribers may be
            emailed. Sign-ups stay pending until the person clicks the link in their confirmation
            email.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Locale</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 text-ink">{s.email}</td>
                  <td className="py-2.5">
                    {s.unsubscribedAt ? (
                      <Badge tone="red">Unsubscribed</Badge>
                    ) : s.confirmedAt ? (
                      <Badge tone="green">Confirmed</Badge>
                    ) : (
                      <Badge tone="amber">Pending</Badge>
                    )}
                  </td>
                  <td className="py-2.5 uppercase text-muted">{s.locale}</td>
                  <td className="py-2.5 text-muted">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
