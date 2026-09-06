"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check, Gift, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";

type Variant = { id: string; label: string; priceCents: number };

export function GiftCardPicker({ productId, variants }: { productId: string; variants: Variant[] }) {
  const fr = useLocale() === "fr";
  const { addItem } = useCart();
  const [selected, setSelected] = useState(variants[1]?.id ?? variants[0]?.id);
  const [added, setAdded] = useState(false);
  const v = variants.find((x) => x.id === selected) ?? variants[0];

  function add() {
    if (!v) return;
    addItem({
      id: `${productId}:${v.id}`,
      productId,
      slug: "velvea-gift-card",
      name: fr ? "Carte-cadeau Velvea" : "Velvea Gift Card",
      variantId: v.id,
      variantLabel: v.label,
      unitPriceCents: v.priceCents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div>
      {/* preview */}
      <div className="relative mb-6 overflow-hidden rounded-[1.5rem] p-8 text-white shadow-lg" style={{ background: "var(--grad-iris)" }}>
        <div className="flex items-start justify-between">
          <span className="font-display text-2xl tracking-wide">VELVÉA</span>
          <Gift className="h-6 w-6" />
        </div>
        <p className="mt-10 text-sm opacity-80">{fr ? "Carte-cadeau" : "Gift Card"}</p>
        <p className="font-display text-4xl">{v ? formatMoney(v.priceCents) : ""}</p>
      </div>

      <p className="label">{fr ? "Montant" : "Amount"}</p>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelected(variant.id)}
            className={cn(
              "rounded-xl border-2 py-3 text-sm font-semibold transition-colors",
              selected === variant.id ? "border-ink bg-cream/50" : "border-line text-ink-soft hover:border-line-strong"
            )}
          >
            {formatMoney(variant.priceCents)}
          </button>
        ))}
      </div>

      <button onClick={add} className={cn("btn btn-gold btn-lg mt-6 w-full", added && "!bg-success")}>
        {added ? <><Check className="h-4 w-4" /> {fr ? "Ajouté" : "Added"}</> : <><ShoppingBag className="h-4 w-4" /> {fr ? "Ajouter au panier" : "Add to bag"}</>}
      </button>
      <p className="mt-3 text-xs text-muted">
        {fr
          ? "Livrée par courriel avec un code unique après l'achat."
          : "Delivered by email with a unique code after purchase."}
      </p>
    </div>
  );
}
