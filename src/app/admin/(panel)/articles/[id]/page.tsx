import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm, type ArticleFormData } from "@/components/admin/ArticleForm";
export const dynamic = "force-dynamic";
const asL = (v: unknown) => { const o = (v ?? {}) as Record<string, string>; return { en: o.en ?? "", fr: o.fr ?? "" }; };
export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let a; try { a = await prisma.article.findUnique({ where: { id } }); } catch { a = null; }
  if (!a) notFound();
  const initial: ArticleFormData = {
    id: a.id, slug: a.slug, category: a.category, title: asL(a.title), excerpt: asL(a.excerpt), body: asL(a.body),
    coverImage: a.coverImage, coverPublicId: a.coverPublicId, author: a.author ?? "", readMinutes: a.readMinutes,
    status: a.status, featured: a.featured,
  };
  return (<><h1 className="mb-6 font-display text-3xl text-ink">Edit guide</h1><ArticleForm initial={initial} /></>);
}
