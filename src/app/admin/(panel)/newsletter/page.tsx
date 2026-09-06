import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Card } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  let subs;
  try {
    subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  } catch {
    subs = null;
  }
  return (
    <>
      <PageHeader title="Newsletter" subtitle={subs ? `${subs.length} subscribers` : ""} />
      {!subs ? (
        <EmptyState title="Database not connected" />
      ) : subs.length === 0 ? (
        <EmptyState title="No subscribers yet" description="Newsletter sign-ups from the footer appear here." />
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Locale</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 text-ink">{s.email}</td>
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
