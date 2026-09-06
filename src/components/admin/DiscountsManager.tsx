"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, Badge } from "./ui";
import { Field, TextInput, Select, Toggle } from "./form";
import { upsertDiscount, deleteDiscount } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/utils";
import type { DiscountType } from "@prisma/client";

type Discount = {
  code: string;
  type: DiscountType;
  value: number;
  minSubtotalCents: number;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export function DiscountsManager({ initial }: { initial: Discount[] }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as DiscountType,
    value: 10,
    minDollars: 0,
    usageLimit: "",
    active: true,
  });

  function create() {
    if (!form.code.trim()) return;
    start(async () => {
      await upsertDiscount({
        code: form.code,
        type: form.type,
        value: form.type === "PERCENT" ? form.value : Math.round(form.value * 100),
        minSubtotalCents: Math.round(form.minDollars * 100),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        active: form.active,
        isNew: true,
      });
      setForm({ code: "", type: "PERCENT", value: 10, minDollars: 0, usageLimit: "", active: true });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        {initial.length === 0 && (
          <Card><p className="text-sm text-muted">No discount codes yet. Create one on the right.</p></Card>
        )}
        {initial.map((d) => (
          <Card key={d.code} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-ink">{d.code}</span>
                <Badge tone={d.active ? "green" : "gray"}>{d.active ? "Active" : "Off"}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {d.type === "PERCENT" ? `${d.value}% off` : d.type === "FREE_SHIPPING" ? "Free shipping" : `${formatMoney(d.value)} off`}
                {d.minSubtotalCents > 0 && ` · min ${formatMoney(d.minSubtotalCents)}`}
                {d.usageLimit && ` · ${d.usedCount}/${d.usageLimit} used`}
              </p>
            </div>
            <button
              onClick={() => start(() => deleteDiscount(d.code))}
              className="text-muted hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">New discount</h2>
        <Field label="Code"><TextInput value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} placeholder="WELCOME10" /></Field>
        <Field label="Type">
          <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as DiscountType })}
            options={[{ value: "PERCENT", label: "Percentage off" }, { value: "FIXED", label: "Fixed amount off" }, { value: "FREE_SHIPPING", label: "Free shipping" }]} />
        </Field>
        {form.type !== "FREE_SHIPPING" && (
          <Field label={form.type === "PERCENT" ? "Percent (%)" : "Amount ($)"}>
            <TextInput type="number" value={String(form.value)} onChange={(v) => setForm({ ...form, value: parseFloat(v) || 0 })} />
          </Field>
        )}
        <Field label="Minimum subtotal ($)"><TextInput type="number" value={String(form.minDollars)} onChange={(v) => setForm({ ...form, minDollars: parseFloat(v) || 0 })} /></Field>
        <Field label="Usage limit (optional)"><TextInput type="number" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} placeholder="Unlimited" /></Field>
        <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Active" />
        <button onClick={create} disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create discount
        </button>
      </Card>
    </div>
  );
}
