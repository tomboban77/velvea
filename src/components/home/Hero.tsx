import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowDown, ArrowUpRight, Gift, ArrowRight } from "lucide-react";
import { SameDayNotice } from "@/components/ui/SameDayNotice";
import { formatMoney } from "@/lib/utils";

export type HeroProduct = { slug: string; name: string; image: string | null; priceCents: number } | null;

export async function Hero({ product }: { product: HeroProduct }) {
  const t = await getTranslations("hero");
  const locale = await getLocale();
  const fr = locale === "fr";
  return (
    <section className="hero-section">
      <div className="container-x hero-grid">
        <div className="hero-copy">
          <p className="eyebrow anim-rise"><span className="hero-dot" />{t("eyebrow")}</p>
          <h1 className="hero-title anim-rise" style={{ animationDelay: "80ms" }}>{t("titleA")}<br /><em>{t("titleB")}</em><br />{t("titleC")}</h1>
          <p className="hero-lede anim-rise" style={{ animationDelay: "160ms" }}>{t("lede")}</p>
          <div className="hero-actions anim-rise" style={{ animationDelay: "220ms" }}>
            <Link href="/baskets" className="btn btn-primary">{t("ctaPrimary")}<ArrowUpRight /></Link>
            <Link href="/custom" className="hero-secondary">{t("ctaSecondary")}<ArrowRight size={16} /></Link>
          </div>
          <div className="hero-delivery anim-rise" style={{ animationDelay: "280ms" }}><SameDayNotice /></div>
        </div>
        <div className="hero-visual anim-fade">
          <div className="hero-image-wrap">
            <Image src={product?.image || "/images/gifting-editorial.webp"} alt={product?.image ? product.name : fr ? "Coffrets ivoire et rubans prune, inspiration de notre atelier" : "Ivory gift boxes with plum ribbons, inspiration from our atelier"} fill priority sizes="(max-width: 767px) 100vw, 52vw" className="hero-image" />
            <div className="hero-image-shade" />
            <div className="hero-image-label"><span>VELVÉA</span><span>{fr ? "L’art d’offrir" : "Thoughtfully selected. Beautifully given."}</span></div>
          </div>
          <div className="hero-seal" aria-hidden="true"><Gift size={24} strokeWidth={1.2} /><span>{fr ? "Préparé" : "Made to"}<br />{fr ? "avec soin" : "mean more"}</span></div>
          {product?.image ? (
            <Link href={`/products/${product.slug}`} className="hero-product">
              <div><p className="eyebrow no-tick">{t("pictured")}</p><p className="hero-product-name">{product.name}</p></div>
              <div className="flex shrink-0 items-center gap-4"><span className="text-sm font-medium">{formatMoney(product.priceCents, fr ? "fr-CA" : "en-CA")}</span><span className="circle-arrow"><ArrowUpRight size={20} /></span></div>
            </Link>
          ) : <Link href="/custom" className="hero-product"><p className="hero-product-name">{fr ? "Un cadeau aussi unique qu’eux." : "A little thought. A lasting impression."}</p><span className="circle-arrow"><ArrowUpRight size={20} /></span></Link>}
        </div>
      </div>
      <div className="container-x hero-bottom"><span>{fr ? "Pour les grands moments. Et les petits bonheurs." : "For the big moments. And the just-because ones."}</span><a href="#collection" aria-label={fr ? "Découvrir la collection" : "Discover the collection"}><ArrowDown size={16} /></a></div>
    </section>
  );
}
