"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Minus, Check, Sparkles, ShoppingBag, Package } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, cn } from "@/lib/utils";

type Container = { id: string; name: string; priceCents: number; image: string | null; capacity: number };
type Item = { id: string; name: string; priceCents: number; image: string | null };
type Category = { id: string; name: string; items: Item[] };

export function CustomBuilder({
  data,
}: {
  data: { containers: Container[]; categories: Category[] };
}) {
  const locale = useLocale();
  const fr = locale === "fr";
  const { addItem } = useCart();
  const [containerId, setContainerId] = useState(data.containers[0]?.id ?? "");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const container = data.containers.find((c) => c.id === containerId)!;
  const allItems = useMemo(
    () => Object.fromEntries(data.categories.flatMap((c) => c.items).map((i) => [i.id, i])),
    [data.categories]
  );

  const itemCount = Object.values(selected).reduce((a, b) => a + b, 0);
  const capacity = container?.capacity ?? 8;

  const itemsTotal = Object.entries(selected).reduce(
    (sum, [id, qty]) => sum + (allItems[id]?.priceCents ?? 0) * qty,
    0
  );
  const total = (container?.priceCents ?? 0) + itemsTotal;

  function adjust(id: string, delta: number) {
    setSelected((prev) => {
      const current = prev[id] ?? 0;
      if (delta > 0 && itemCount >= capacity) return prev;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  function addToBag() {
    const itemIds: string[] = [];
    for (const [id, qty] of Object.entries(selected))
      for (let i = 0; i < qty; i++) itemIds.push(id);

    addItem({
      id: `custom-${crypto.randomUUID()}`,
      name: fr ? "Panier personnalisé" : "Custom Basket",
      image: container?.image ?? undefined,
      unitPriceCents: total,
      isCustom: true,
      customConfig: { containerId, itemIds, note },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.5fr_1fr]">
      {/* builder */}
      <div className="space-y-10">
        {/* step 1: container */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">1</span>
            <h2 className="font-display text-2xl">{fr ? "Choisissez un contenant" : "Choose your vessel"}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.containers.map((c) => (
              <button
                key={c.id}
                onClick={() => setContainerId(c.id)}
                className={cn(
                  "group overflow-hidden rounded-2xl border-2 text-left transition-all",
                  containerId === c.id ? "border-ink" : "border-line hover:border-line-strong"
                )}
              >
                <div className="relative aspect-[4/3] bg-cream">
                  {c.image ? (
                    <Image src={c.image} alt={c.name} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,#fbf8f2,#efe6d6)]">
                      <Package className="h-7 w-7 text-line-strong" />
                    </div>
                  )}
                  {containerId === c.id && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-canvas">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-muted">
                    {formatMoney(c.priceCents)} · {fr ? "jusqu'à" : "holds"} {c.capacity}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* step 2: items */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">2</span>
              <h2 className="font-display text-2xl">{fr ? "Ajoutez vos favoris" : "Add your favourites"}</h2>
            </div>
            <span className={cn("text-sm font-medium", itemCount >= capacity ? "text-violet" : "text-muted")}>
              {itemCount}/{capacity}
            </span>
          </div>

          <div className="space-y-8">
            {data.categories.map((cat) => (
              <div key={cat.id}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet">{cat.name}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cat.items.map((item) => {
                    const qty = selected[item.id] ?? 0;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                          qty > 0 ? "border-ink bg-cream/40" : "border-line"
                        )}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Sparkles className="h-4 w-4 text-line-strong" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">{item.name}</p>
                          <p className="text-xs text-muted">{formatMoney(item.priceCents)}</p>
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => adjust(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-ink-soft hover:text-ink" aria-label="Remove">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                            <button onClick={() => adjust(item.id, 1)} disabled={itemCount >= capacity} className="flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-ink-soft hover:text-ink disabled:opacity-40" aria-label="Add">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => adjust(item.id, 1)} disabled={itemCount >= capacity} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-canvas hover:bg-charcoal disabled:opacity-40" aria-label="Add">
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[1.75rem] border border-line bg-shell p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">3</span>
            <h2 className="font-display text-2xl">{fr ? "Votre panier" : "Your basket"}</h2>
          </div>

          <div className="mt-5 flex items-center justify-between border-b border-line pb-3 text-sm">
            <span className="font-medium text-ink">{container?.name}</span>
            <span>{formatMoney(container?.priceCents ?? 0)}</span>
          </div>

          {itemCount === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {fr ? "Ajoutez des articles pour composer votre panier." : "Add items to fill your basket."}
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto py-3">
              {Object.entries(selected).map(([id, qty]) => {
                const item = allItems[id];
                if (!item) return null;
                return (
                  <li key={id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{item.name} × {qty}</span>
                    <span>{formatMoney(item.priceCents * qty)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={fr ? "Note ou message cadeau (optionnel)" : "Note or gift message (optional)"}
            className="field mt-3 resize-y text-sm"
          />

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl">{formatMoney(total)}</span>
          </div>

          <button
            onClick={addToBag}
            disabled={itemCount === 0}
            className={cn("btn btn-gold btn-lg mt-4 w-full disabled:opacity-50", added && "!bg-success")}
          >
            {added ? (
              <><Check className="h-4 w-4" /> {fr ? "Ajouté" : "Added to bag"}</>
            ) : (
              <><ShoppingBag className="h-4 w-4" /> {fr ? "Ajouter au panier" : "Add to bag"}</>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            {fr ? "Emballé à la main à la commande." : "Hand-packed to order."}
          </p>
        </div>
      </div>
    </div>
  );
}
