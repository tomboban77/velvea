"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductView } from "@/lib/view";
import { cn } from "@/lib/utils";

export type CollectionTab = {
  key: string;
  label: string;
  href: string;
  seeAll: string;
  products: ProductView[];
};

/** Tabbed product showcase: each tab is a curated list, with a "see all" link beneath. */
export function CollectionTabs({ tabs }: { tabs: CollectionTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!tab) return null;

  return (
    <div>
      {tabs.length > 1 && (
        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={t.key === tab.key}
              className={cn("tab", t.key === tab.key && "is-active")}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div key={tab.key} className="grid-products anim-fade mt-8" role="tabpanel">
        {tab.products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href={tab.href} className="btn btn-outline">
          {tab.seeAll} <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
