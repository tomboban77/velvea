"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Pencil, X, AlertTriangle } from "lucide-react";
import { Card, Badge } from "./ui";
import { Field, TextInput, TextArea, Select, Toggle } from "./form";
import { upsertDeliveryZone, deleteDeliveryZone } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/utils";
import type { ZoneKind } from "@prisma/client";

export type ZoneRow = {
  id: string;
  key: string;
  name: { en: string; fr: string };
  kind: ZoneKind;
  fsaPrefixes: string[];
  fsaLetters: string[];
  provinces: string[];
  baseFeeCents: number;
  extraItemCents: number;
  sameDaySurchargeCents: number;
  freeThresholdCents: number | null;
  sameDayCutoff: string | null;
  minLeadDays: number;
  maxLeadDays: number;
  position: number;
  active: boolean;
};

type FormState = {
  id: string | null;
  key: string;
  nameEn: string;
  nameFr: string;
  kind: ZoneKind;
  fsaPrefixes: string;
  fsaLetters: string;
  provinces: string;
  baseDollars: string;
  extraDollars: string;
  sameDayDollars: string;
  freeThresholdDollars: string;
  sameDayCutoff: string;
  minLeadDays: string;
  maxLeadDays: string;
  position: string;
  active: boolean;
};

const blank: FormState = {
  id: null,
  key: "",
  nameEn: "",
  nameFr: "",
  kind: "LOCAL",
  fsaPrefixes: "",
  fsaLetters: "",
  provinces: "ON",
  baseDollars: "0",
  extraDollars: "0",
  sameDayDollars: "0",
  freeThresholdDollars: "",
  sameDayCutoff: "",
  minLeadDays: "1",
  maxLeadDays: "2",
  position: "50",
  active: false,
};

const KINDS: { value: ZoneKind; label: string }[] = [
  { value: "PICKUP", label: "Pickup — collected from us" },
  { value: "LOCAL", label: "Local — we drive it" },
  { value: "SHIPPING", label: "Shipping — carrier" },
  { value: "QUOTE", label: "Quote by hand" },
  { value: "BLOCKED", label: "Blocked — we don't deliver here" },
];

/** Accepts commas, spaces or newlines so a list can be pasted from anywhere. */
function toList(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
}

function fromZone(z: ZoneRow): FormState {
  return {
    id: z.id,
    key: z.key,
    nameEn: z.name?.en ?? "",
    nameFr: z.name?.fr ?? "",
    kind: z.kind,
    fsaPrefixes: z.fsaPrefixes.join(", "),
    fsaLetters: z.fsaLetters.join(", "),
    provinces: z.provinces.join(", "),
    baseDollars: (z.baseFeeCents / 100).toFixed(2),
    extraDollars: (z.extraItemCents / 100).toFixed(2),
    sameDayDollars: (z.sameDaySurchargeCents / 100).toFixed(2),
    freeThresholdDollars:
      z.freeThresholdCents === null ? "" : (z.freeThresholdCents / 100).toFixed(2),
    sameDayCutoff: z.sameDayCutoff ?? "",
    minLeadDays: String(z.minLeadDays),
    maxLeadDays: String(z.maxLeadDays),
    position: String(z.position),
    active: z.active,
  };
}

function coverage(z: ZoneRow): string {
  const parts: string[] = [];
  if (z.fsaLetters.length) {
    parts.push(z.fsaLetters.join("/") + " — whole region");
  }
  if (z.fsaPrefixes.length) {
    parts.push(z.fsaPrefixes.length + " FSA" + (z.fsaPrefixes.length > 1 ? "s" : ""));
  }
  if (!parts.length) parts.push("no postal rules");
  return parts.join(" · ");
}

function describe(z: ZoneRow): string {
  const parts = [coverage(z)];
  if (z.kind === "LOCAL" || z.kind === "SHIPPING") {
    parts.push(z.baseFeeCents ? formatMoney(z.baseFeeCents) : "Free");
    if (z.extraItemCents) parts.push("+" + formatMoney(z.extraItemCents) + " per extra basket");
  }
  if (z.sameDayCutoff) {
    const premium = z.sameDaySurchargeCents
      ? " (+" + formatMoney(z.sameDaySurchargeCents) + ")"
      : "";
    parts.push("same-day to " + z.sameDayCutoff + premium);
  }
  if (z.freeThresholdCents !== null) parts.push("free over " + formatMoney(z.freeThresholdCents));
  return parts.join(" · ");
}

const toCents = (v: string) => Math.round((parseFloat(v) || 0) * 100);
const toInt = (v: string) => parseInt(v, 10) || 0;

export function DeliveryZonesManager({ initial }: { initial: ZoneRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const off = initial.filter((z) => !z.active).length;

  function save() {
    setError(null);
    start(async () => {
      try {
        await upsertDeliveryZone({
          id: form.id,
          key: form.key,
          nameEn: form.nameEn,
          nameFr: form.nameFr || form.nameEn,
          kind: form.kind,
          fsaPrefixes: toList(form.fsaPrefixes),
          fsaLetters: toList(form.fsaLetters),
          provinces: toList(form.provinces),
          baseFeeCents: toCents(form.baseDollars),
          extraItemCents: toCents(form.extraDollars),
          sameDaySurchargeCents: toCents(form.sameDayDollars),
          freeThresholdCents:
            form.freeThresholdDollars.trim() === ""
              ? null
              : toCents(form.freeThresholdDollars),
          sameDayCutoff: form.sameDayCutoff.trim() || null,
          minLeadDays: toInt(form.minLeadDays),
          maxLeadDays: toInt(form.maxLeadDays),
          position: toInt(form.position),
          active: form.active,
        });
        setForm(blank);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the zone.");
      }
    });
  }

  function remove(id: string) {
    setError(null);
    start(async () => {
      try {
        await deleteDeliveryZone(id);
        if (form.id === id) setForm(blank);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not delete the zone.");
      }
    });
  }

  const isLocalish = form.kind === "LOCAL" || form.kind === "PICKUP";
  const charges = form.kind === "LOCAL" || form.kind === "SHIPPING";

  return (
    <div className="space-y-4">
      {off > 0 && (
        <Card className="border-amber/40 bg-amber/5">
          <p className="flex items-start gap-2 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <span>
              <strong className="font-semibold">
                {off} zone{off > 1 ? "s are" : " is"} switched off.
              </strong>{" "}
              Seeded zones start inactive until their postal prefixes have been checked
              against Canada Post. Addresses they would have covered fall through to the
              next matching zone, so nothing is refused — those customers are simply
              quoted the broader rate. Verify the FSAs, then switch each one on.
            </span>
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {initial.length === 0 && (
            <Card>
              <p className="text-sm text-muted">
                No delivery zones yet. Until one exists, checkout cannot price anything —
                run the seed, or create the first zone on the right.
              </p>
            </Card>
          )}
          {initial.map((z) => (
            <Card key={z.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{z.name?.en || z.key}</span>
                  <Badge tone={z.active ? "green" : "gray"}>{z.active ? "Active" : "Off"}</Badge>
                  <Badge tone="violet">{z.kind}</Badge>
                  <span className="font-mono text-xs text-muted">{z.key}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{describe(z)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(fromZone(z));
                    setError(null);
                  }}
                  className="text-muted hover:text-violet"
                  aria-label={"Edit " + z.key}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(z.id)}
                  className="text-muted hover:text-danger"
                  aria-label={"Delete " + z.key}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">{form.id ? "Edit zone" : "New zone"}</h3>
            {form.id && (
              <button
                type="button"
                onClick={() => {
                  setForm(blank);
                  setError(null);
                }}
                className="text-muted hover:text-ink"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name (EN)">
                <TextInput value={form.nameEn} onChange={(v) => set("nameEn", v)} />
              </Field>
              <Field label="Name (FR)">
                <TextInput value={form.nameFr} onChange={(v) => set("nameFr", v)} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Key" hint="Recorded on every order — don't rename casually.">
                <TextInput value={form.key} onChange={(v) => set("key", v)} placeholder="local-a" />
              </Field>
              <Field label="Kind">
                <Select
                  value={form.kind}
                  onChange={(v) => set("kind", v as ZoneKind)}
                  options={KINDS}
                />
              </Field>
            </div>

            <Field
              label="FSA prefixes"
              hint="Exact 3-character prefixes like L5B. These beat first letters, so a remote area can be carved out of a broad rule."
            >
              <TextArea
                rows={4}
                value={form.fsaPrefixes}
                onChange={(v) => set("fsaPrefixes", v)}
                placeholder="L5A, L5B, L5C…"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="First letters"
                hint="Whole regions. In Ontario: M Toronto, L Golden Horseshoe, N southwest, K east, P north."
              >
                <TextInput
                  value={form.fsaLetters}
                  onChange={(v) => set("fsaLetters", v)}
                  placeholder="K, L, N"
                />
              </Field>
              <Field label="Provinces" hint="Guard only; blank means any.">
                <TextInput
                  value={form.provinces}
                  onChange={(v) => set("provinces", v)}
                  placeholder="ON"
                />
              </Field>
            </div>

            {charges && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Base fee ($)">
                    <TextInput
                      type="number"
                      value={form.baseDollars}
                      onChange={(v) => set("baseDollars", v)}
                    />
                  </Field>
                  <Field label="Per extra basket ($)" hint="Zero for local — one trip carries the lot.">
                    <TextInput
                      type="number"
                      value={form.extraDollars}
                      onChange={(v) => set("extraDollars", v)}
                    />
                  </Field>
                </div>
                <Field label="Free over ($)" hint="Blank means never free.">
                  <TextInput
                    type="number"
                    value={form.freeThresholdDollars}
                    onChange={(v) => set("freeThresholdDollars", v)}
                    placeholder="never"
                  />
                </Field>
              </>
            )}

            {form.kind === "LOCAL" && (
              <Field
                label="Same-day surcharge ($)"
                hint="Added on top of the base fee for same-day — it is a dedicated run, not a stop on tomorrow's route."
              >
                <TextInput
                  type="number"
                  value={form.sameDayDollars}
                  onChange={(v) => set("sameDayDollars", v)}
                />
              </Field>
            )}

            {isLocalish && (
              <Field
                label="Same-day cutoff (HH:MM)"
                hint="Blank means no same-day here — right for anywhere too far to reach and return."
              >
                <TextInput
                  value={form.sameDayCutoff}
                  onChange={(v) => set("sameDayCutoff", v)}
                  placeholder="16:00"
                />
              </Field>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Min days">
                <TextInput
                  type="number"
                  value={form.minLeadDays}
                  onChange={(v) => set("minLeadDays", v)}
                />
              </Field>
              <Field label="Max days">
                <TextInput
                  type="number"
                  value={form.maxLeadDays}
                  onChange={(v) => set("maxLeadDays", v)}
                />
              </Field>
              <Field label="Order" hint="Lower first.">
                <TextInput
                  type="number"
                  value={form.position}
                  onChange={(v) => set("position", v)}
                />
              </Field>
            </div>

            <Toggle
              checked={form.active}
              onChange={(v) => set("active", v)}
              label="Active"
              description="Only active zones are matched at checkout."
            />

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="btn btn-primary w-full"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {form.id ? "Save zone" : "Create zone"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
