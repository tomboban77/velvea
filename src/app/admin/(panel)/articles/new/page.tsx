import { ArticleForm } from "@/components/admin/ArticleForm";
import { emptyArticle } from "@/lib/admin-forms";
export const dynamic = "force-dynamic";
export default function NewArticle() {
  return (<><h1 className="mb-6 font-display text-3xl text-ink">New guide</h1><ArticleForm initial={emptyArticle()} /></>);
}
