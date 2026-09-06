import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Card, Badge, AdminLink } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { t } from "@/lib/i18n-content";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  let articles;
  try { articles = await prisma.article.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }); }
  catch { articles = null; }
  return (
    <>
      <PageHeader title="Gift Guides" subtitle="Editorial articles and gifting advice." action={<AdminLink href="/admin/articles/new"><Plus className="h-4 w-4" /> New guide</AdminLink>} />
      {!articles ? <EmptyState title="Database not connected" /> :
        articles.length === 0 ? <EmptyState title="No guides yet" description="Write your first gift guide." action={<AdminLink href="/admin/articles/new"><Plus className="h-4 w-4" /> New guide</AdminLink>} /> :
        <div className="space-y-2">
          {articles.map((a) => (
            <Card key={a.id} className="!p-0">
              <Link href={`/admin/articles/${a.id}`} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">{t(a.title, "en")}</p>
                  <p className="text-xs text-muted">{a.category.toLowerCase()} · /{a.slug} · {formatDate(a.updatedAt)}</p>
                </div>
                <Badge tone={a.status === "PUBLISHED" ? "green" : "amber"}>{a.status}</Badge>
                {a.featured && <Badge tone="iris">Featured</Badge>}
              </Link>
            </Card>
          ))}
        </div>}
    </>
  );
}
