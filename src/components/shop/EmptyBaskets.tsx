import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PackageOpen, Sparkles } from "lucide-react";

export async function EmptyBaskets() {
  const t = await getTranslations();
  return (
    <div className="rounded-[2rem] border border-dashed border-line-strong bg-cream/40 px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-shell">
        <PackageOpen className="h-6 w-6 text-muted" />
      </div>
      <p className="mt-5 font-display text-2xl">No baskets here yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        We&apos;re curating this collection. In the meantime, explore our full range or
        build something bespoke.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/baskets" className="btn btn-primary btn-sm">
          {t("nav.allBaskets")}
        </Link>
        <Link href="/custom" className="btn btn-outline btn-sm">
          <Sparkles className="h-4 w-4 text-gold" /> {t("common.buildCustom")}
        </Link>
      </div>
    </div>
  );
}
