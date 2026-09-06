import { getTranslations } from "next-intl/server";
import { Truck, Sparkles, ShieldCheck, Leaf, Clock, MapPin } from "lucide-react";

// Honest trust markers for a new brand (no borrowed logos).
export async function TrustBar() {
  const t = await getTranslations();
  const items = [
    { icon: MapPin, label: t("hero.chipCanada") },
    { icon: Clock, label: t("delivery.tileSameDaySub") },
    { icon: Sparkles, label: t("hero.badge") },
    { icon: ShieldCheck, label: t("common.verifiedBuyer") + "s" },
    { icon: Leaf, label: "Sustainable packaging" },
    { icon: Truck, label: t("delivery.tileReliableSub") },
  ];
  return (
    <div className="border-y border-line bg-cream/70">
      <div className="container-x flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-5">
        {items.map((it) => (
          <span
            key={it.label}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft"
          >
            <it.icon className="h-4 w-4 text-gold" />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}
