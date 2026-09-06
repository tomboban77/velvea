"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { Card } from "./ui";
import { Field, TextInput } from "./form";
import { updateSettings } from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    start(async () => {
      await updateSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  const money = (c: number) => (c / 100).toString();
  const toCents = (v: string) => Math.round((parseFloat(v) || 0) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        {saved && <span className="flex items-center gap-1 text-sm text-success"><Check className="h-4 w-4" /> Saved</span>}
        <button onClick={save} disabled={pending} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
        </button>
      </div>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email"><TextInput value={s.contact.email} onChange={(v) => setS({ ...s, contact: { ...s.contact, email: v } })} /></Field>
          <Field label="Phone"><TextInput value={s.contact.phone} onChange={(v) => setS({ ...s, contact: { ...s.contact, phone: v } })} /></Field>
          <Field label="Address"><TextInput value={s.contact.addressLine} onChange={(v) => setS({ ...s, contact: { ...s.contact, addressLine: v } })} /></Field>
          <Field label="City"><TextInput value={s.contact.city} onChange={(v) => setS({ ...s, contact: { ...s.contact, city: v } })} /></Field>
          <Field label="Province"><TextInput value={s.contact.province} onChange={(v) => setS({ ...s, contact: { ...s.contact, province: v } })} /></Field>
          <Field label="Postal code"><TextInput value={s.contact.postalCode} onChange={(v) => setS({ ...s, contact: { ...s.contact, postalCode: v } })} /></Field>
          <Field label="Hours"><TextInput value={s.contact.hours} onChange={(v) => setS({ ...s, contact: { ...s.contact, hours: v } })} /></Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Social</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram"><TextInput value={s.social.instagram} onChange={(v) => setS({ ...s, social: { ...s.social, instagram: v } })} /></Field>
          <Field label="Facebook"><TextInput value={s.social.facebook} onChange={(v) => setS({ ...s, social: { ...s.social, facebook: v } })} /></Field>
          <Field label="Pinterest"><TextInput value={s.social.pinterest} onChange={(v) => setS({ ...s, social: { ...s.social, pinterest: v } })} /></Field>
          <Field label="TikTok"><TextInput value={s.social.tiktok} onChange={(v) => setS({ ...s, social: { ...s.social, tiktok: v } })} /></Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Delivery & shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Same-day cutoff (HH:MM)"><TextInput value={s.delivery.sameDayCutoff} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, sameDayCutoff: v } })} /></Field>
          <Field label="Free shipping threshold ($)"><TextInput type="number" value={money(s.delivery.freeShippingThresholdCents)} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, freeShippingThresholdCents: toCents(v) } })} /></Field>
          <Field label="Standard shipping ($)"><TextInput type="number" value={money(s.delivery.standardShippingCents)} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, standardShippingCents: toCents(v) } })} /></Field>
          <Field label="Express shipping ($)"><TextInput type="number" value={money(s.delivery.expressShippingCents)} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, expressShippingCents: toCents(v) } })} /></Field>
          <Field label="Local same-day fee ($)"><TextInput type="number" value={money(s.delivery.localSameDayFeeCents)} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, localSameDayFeeCents: toCents(v) } })} /></Field>
          <Field label="Local standard fee ($)"><TextInput type="number" value={money(s.delivery.localStandardFeeCents)} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, localStandardFeeCents: toCents(v) } })} /></Field>
        </div>
        <p className="text-xs text-muted">
          Note: the client-side checkout preview uses built-in defaults. After changing these, the authoritative totals at checkout update immediately; update the preview constants in <code>settings-client.ts</code> to match the summary shown before payment.
        </p>
      </Card>
    </div>
  );
}
