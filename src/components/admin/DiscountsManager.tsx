"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Pencil, X } from "lucide-react";
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
  perCustomerLimit: number | null;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  active: boolean;
};

type FormState = {
  code: string;
  type: DiscountType;
  value: number;
  minDollars: number;
  usageLimit: string;
  perCustomerLimit: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const blank: FormState = {
  code: "",
  type: "PERCENT",
  value: 10,
  minDollars: 0,
  usageLimit: "",
  perCustomerLimit: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

/** `datetime-local` wants "YYYY-MM-DDTHH:mm". */
function toLocalInput(value: Date | string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function fromDiscount(d: Discount): FormState {
  return {
    code: d.code,
    type: d.type,
    value: d.type === "FIXED" ? d.value / 100 : d.value,
    minDollars: d.minSubtotalCents / 100,
    usageLimit: d.usageLimit ? String(d.usageLimit) : "",
    perCustomerLimit: d.perCustomerLimit ? String(d.perCustomerLimit) : "",
    startsAt: toLocalInput(d.startsAt),
    endsAt: toLocalInput(d.endsAt),
    active: d.active,
  };
}

function describe(d: Discount): string {
  const parts = [
    d.type === "PERCENT"
      ? `${d.value}% off`
      : d.type === "FREE_SHIPPING"
      ? "Free shipping"
      : `${formatMoney(d.value)} off`,
  ];
  if (d.minSubtotalCents > 0) parts.push(`min ${formatMoney(d.minSubtotalCents)}`);
  parts.push(d.usageLimit ? `${d.usedCount}/${d.usageLimit} used` : `${d.usedCount} used`);
  if (d.perCustomerLimit) parts.push(`${d.perCustomerLimit} per customer`);
  if (d.startsAt) parts.push(`from ${new Date(d.startsAt).toLocaleDateString()}`);
  if (d.endsAt) parts.push(`until ${new Date(d.endsAt).toLocaleDateString()}`);
  return parts.join(" · ");
}

export function DiscountsManager({ initial }: { initial: Discount[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  /** null = creating a new code; otherwise the code being edited. */
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  function save() {
    if (!form.code.trim()) return setError("Enter a code.");
    setError(null);
    start(async () => {
      try {
        await upsertDiscount({
          code: form.code,
          type: form.type,
          value: form.type === "FIXED" ? Math.round(form.value * 100) : Math.round(form.value),
          minSubtotalCents: Math.round(form.minDollars * 100),
          usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
          perCustomerLimit: form.perCustomerLimit ? parseInt(form.perCustomerLimit, 10) : null,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          active: form.active,
          isNew: editing === null,
        });
        setForm(blank);
        setEditing(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the discount.");
      }
    });
  }

  function remove(code: string) {
    setError(null);
    start(async () => {
      try {
        await deleteDiscount(code);
        if (editing === code) {
          setEditing(null);
          setForm(blank);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not delete the discount.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        {initial.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No discount codes yet. Create one on the right.</p>
          </Card>
        )}
        {initial.map((d) => (
          <Card key={d.code} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-ink">{d.code}</span>
                <Badge tone={d.active ? "green" : "gray"}>{d.active ? "Active" : "Off"}</Badge>
                {d.usageLimit !== null && d.usedCount >= d.usageLimit && (
                  <Badge tone="red">Fully redeemed</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{describe(d)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(d.code);
                  setForm(fromDiscount(d));
                  setError(null);
                }}
                className="text-muted hover:text-violet"
                aria-label={`Edit ${d.code}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(d.code)}
                className="text-muted hover:text-danger"
                aria-label={`Delete ${d.code}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">
            {editing ? `Edit ${editing}` : "New discount"}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(blank);
              }}
              className="text-muted hover:text-ink"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Field label="Code">
          <TextInput
            value={form.code}
            onChange={(v) => set("code", v.toUpperCase())}
            placeholder="WELCOME10"
            // The code is the primary key — renaming would orphan past orders.
            disabled={editing !== null}
          />
        </Field>

        <Field label="Type">
          <Select
            value={form.type}
            onChange={(v) => set("type", v as DiscountType)}
            options={[
              { value: "PERCENT", label: "Percentage off" },
              { value: "FIXED", label: "Fixed amount off" },
              { value: "FREE_SHIPPING", label: "Free shipping" },
            ]}
          />
        </Field>

        {form.type !== "FREE_SHIPPING" && (
          <Field label={form.type === "PERCENT" ? "Percent (%)" : "Amount ($)"}>
            <TextInput
              type="number"
              value={String(form.value)}
              onChange={(v) => set("value", parseFloat(v) || 0)}
            />
          </Field>
        )}

        <Field label="Minimum subtotal ($)">
          <TextInput
            type="number"
            value={String(form.minDollars)}
            onChange={(v) => set("minDollars", parseFloat(v) || 0)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total uses">
            <TextInput
              type="number"
              value={form.usageLimit}
              onChange={(v) => set("usageLimit", v)}
              placeholder="Unlimited"
            />
          </Field>
          <Field label="Uses per customer">
            <TextInput
              type="number"
              value={form.perCustomerLimit}
              onChange={(v) => set("perCustomerLimit", v)}
              placeholder="Unlimited"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts">
            <TextInput
              type="datetime-local"
              value={form.startsAt}
              onChange={(v) => set("startsAt", v)}
            />
          </Field>
          <Field label="Ends">
            <TextInput
              type="datetime-local"
              value={form.endsAt}
              onChange={(v) => set("endsAt", v)}
            />
          </Field>
        </div>

        <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Active" />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editing ? "Save changes" : "Create discount"}
        </button>
      </Card>
    </div>
  );
}
