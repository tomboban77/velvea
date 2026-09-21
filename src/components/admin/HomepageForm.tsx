"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Save, Loader2, Check, Star } from "lucide-react";
import { Card } from "./ui";
import { Field, Select } from "./form";
import { updateSettings } from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/utils";

export type PickableProduct = {
  id: string;
  name: string;
  priceCents: number;
  bestseller: boolean;
  image: string | null;
};

type HomeSettings = SiteSettings["home"];

const SLOTS = 5;
const AUTO = "";

/**
 * Admin -> Homepage. Five hero slots, each a product or "Automatic"; the lead
 * is chosen among the picked ones and sits in the centre, largest. Slots left
 * on Automatic are filled by the homepage from featured, then newest baskets.
 */
export function HomepageForm({ initial, products }: { initial: HomeSettings; products: PickableProduct[] }) {
  // Pad the stored ids out to five slots so every select has a value.
  const [slots, setSlots] = useState<string[]>(
    Array.from({ length: SLOTS }, (_, i) => initial.heroProductIds[i] ?? AUTO)
  );
  const [leadId, setLeadId] = useState<string>(initial.heroLeadId ?? AUTO);
  const [limit, setLimit] = useState<number>(initial.collectionLimit);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = new Map(products.map((p) => [p.id, p]));
  const picked = slots.filter((id) => id !== AUTO);
  const leadValid = leadId === AUTO || picked.includes(leadId);

  function setSlot(i: number, id: string) {
    setSlots((prev) => {
      const next = [...prev];
      // A product can only sit in one slot: picking it again moves it.
      if (id !== AUTO) {
        const dup = next.findIndex((v, j) => v === id && j !== i);
        if (dup !== -1) next[dup] = AUTO;
      }
      next[i] = id;
      return next;
    });
  }

  function save() {
    setError(null);
    start(async () => {
      try {
        await updateSettings({
          home: {
            heroProductIds: picked,
            heroLeadId: leadValid && leadId !== AUTO ? leadId : null,
            collectionLimit: Math.min(24, Math.max(4, Math.round(limit) || 8)),
          },
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save.");
      }
    });
  }

  const productOptions = [
    { value: AUTO, label: "Automatic (featured, then newest)" },
    ...products.map((p) => ({
      value: p.id,
      label: `${p.name} · ${formatMoney(p.priceCents)}${p.bestseller ? " · bestseller" : ""}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        {error && <span className="text-sm text-danger">{error}</span>}
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          onClick={save}
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save homepage
        </button>
      </div>

      <Card>
        <h2 className="font-display text-lg">Hero shelf</h2>
        <p className="mt-1 text-sm text-muted">
          Five baskets sit on the shelf at the top of the homepage. The lead is shown largest in the
          middle; the others fan out either side. Only baskets with a photo appear.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {slots.map((id, i) => {
            const p = id !== AUTO ? byId.get(id) : undefined;
            return (
              <div key={i} className="rounded-lg border border-line p-3">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-shell">
                  {p?.image ? (
                    <Image src={p.image} alt="" fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      {p ? "No photo" : "Automatic"}
                    </div>
                  )}
                  {p && leadId === p.id && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[0.7rem] font-semibold text-canvas">
                      <Star className="h-3 w-3" /> Lead
                    </span>
                  )}
                </div>
                <Field label={`Slot ${i + 1}`}>
                  <Select value={id} onChange={(v) => setSlot(i, v)} options={productOptions} />
                </Field>
              </div>
            );
          })}
        </div>

        <div className="mt-5 max-w-md">
          <Field label="Centre (lead) basket">
            <Select
              value={leadValid ? leadId : AUTO}
              onChange={setLeadId}
              options={[
                { value: AUTO, label: picked.length ? "First picked slot" : "Automatic" },
                ...picked.map((pid) => ({ value: pid, label: byId.get(pid)?.name ?? pid })),
              ]}
            />
          </Field>
          {picked.length === 0 && (
            <p className="mt-2 text-xs text-muted">
              Pick at least one basket above to choose a lead. Until then the first featured basket
              takes the centre.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg">Collection section</h2>
        <p className="mt-1 text-sm text-muted">
          How many baskets each tab of &ldquo;Composed for giving&rdquo; shows on the homepage before the
          &ldquo;See all&rdquo; button. Multiples of the grid width (4, 8, 12) fill rows evenly.
        </p>
        <div className="mt-4 max-w-xs">
          <Field label="Baskets per tab (4 to 24)">
            <input
              type="number"
              min={4}
              max={24}
              step={1}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="field"
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
