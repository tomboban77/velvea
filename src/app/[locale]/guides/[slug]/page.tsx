import { setRequestLocale, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ChevronRight, ArrowRight } from "lucide-react";
import { getArticleBySlug } from "@/lib/queries";
import { t as tc } from "@/lib/i18n-content";
import { formatDate } from "@/lib/utils";

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
    <article className="container-x max-w-3xl py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-gold">Velvea</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/guides" className="hover:text-gold">Gift Guides</Link>
      </nav>

      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">{a.category.toLowerCase()}</p>
      <h1 className="mt-3 font-display text-4xl leading-tight balance sm:text-5xl">{tc(a.title, locale)}</h1>
      <p className="mt-3 text-sm text-muted">
        {a.author ?? "Velvea"} · {a.readMinutes} min read
        {a.publishedAt ? ` · ${formatDate(a.publishedAt, locale === "fr" ? "fr-CA" : "en-CA")}` : ""}
      </p>

      <div
        className="prose prose-velvea mt-8 max-w-none prose-headings:font-display"
        dangerouslySetInnerHTML={{ __html: tc(a.body, locale) }}
      />

      <div className="mt-12 rounded-2xl border border-line bg-cream/50 p-8 text-center">
        <h2 className="font-display text-2xl">Find the perfect gift</h2>
        <p className="mt-2 text-ink-soft">Browse hand-packed baskets for every occasion.</p>
        <Link href="/baskets" className="btn btn-primary mt-5">
          Shop Gift Baskets <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
