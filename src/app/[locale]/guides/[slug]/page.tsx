import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ChevronRight, ArrowRight } from "lucide-react";
import { getArticleBySlug } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Gift Guide" };
  return { title: tc(a.seoTitle, locale) || tc(a.title, locale), description: tc(a.excerpt, locale) };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const a = await getArticleBySlug(slug);
  if (!a) notFound();

  return (
    <article className="container-narrow py-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-[0.82rem] text-muted">
        <Link href="/" className="hover:text-violet-deep">Velvéa</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/guides" className="hover:text-violet-deep">{locale === "fr" ? "Guides" : "Gift guides"}</Link>
      </nav>

      <p className="caps">{a.category.toLowerCase()}</p>
      <h1 className="h-display mt-3 balance">{tc(a.title, locale)}</h1>
      <p className="mt-3 text-sm text-muted">
        {a.author ?? "Velvea"} · {a.readMinutes} min read
        {a.publishedAt ? ` · ${formatDate(a.publishedAt, locale === "fr" ? "fr-CA" : "en-CA")}` : ""}
      </p>

      {/* Bodies are sanitised on save, and again here so articles written
          before that check can't render script either. */}
      <div
        className="prose prose-velvea mt-8 max-w-none prose-headings:font-display"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(tc(a.body, locale)) }}
      />

      <div className="band-lilac mt-14 rounded-lg p-8 text-center sm:p-10">
        <h2 className="h-sub">Find the perfect gift</h2>
        <p className="mt-2 text-ink-soft">Browse hand-packed baskets for every occasion.</p>
        <Link href="/baskets" className="btn btn-primary mt-5">
          Shop Gift Baskets <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
