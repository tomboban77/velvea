import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { getFeaturedProducts, getBestsellers } from "@/lib/queries";
import { toProductView } from "@/lib/view";
import { formatMoney } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deal of the Day" };

export default async function DealPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const [feat, best] = await Promise.all([getFeaturedProducts(1), getBestsellers(1)]);
  const p = feat[0] ?? best[0];
  if (!p) return <div className="container-x py-20 text-center text-muted">No deal today. Check back soon.</div>;
  const v = toProductView(p, locale);
  return (
    <div className="container-x py-14">
      <div className="grid gap-10 rounded-[2rem] border border-line bg-cream/50 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-cream">
          {v.image ? <Image src={v.image} alt={v.name} fill sizes="50vw" className="object-cover" /> :
            <div className="flex h-full items-center justify-center"><span className="font-display text-5xl text-line-strong">Velvéa</span></div>}
        </div>
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {fr ? "Offre du jour" : "Deal of the Day"}</p>
          <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{v.name}</h1>
          <p className="mt-3 text-ink-soft">{v.tagline}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatMoney(v.priceCents)}</span>
            {v.compareAtCents && <span className="text-lg text-muted line-through">{formatMoney(v.compareAtCents)}</span>}
          </div>
          <Link href={`/products/${v.slug}`} className="btn btn-gold btn-lg mt-6">
            {fr ? "Voir le panier" : "Shop this basket"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
