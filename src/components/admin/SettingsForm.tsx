"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
        <h2 className="font-display text-lg">Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Daily order cutoff (HH:MM)"
            hint="Orders after this start their lead time tomorrow."
          >
            <TextInput
              value={s.delivery.orderCutoff}
              onChange={(v) => setS({ ...s, delivery: { ...s.delivery, orderCutoff: v } })}
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          Delivery fees, same-day cutoffs and the areas we serve now live in{" "}
          <Link href="/admin/delivery-zones" className="underline">Delivery zones</Link>, one row per
          area. Changes there take effect immediately — the storefront asks the server for a
          quote rather than keeping its own copy of the rates.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Sales tax</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ontario HST (%)"
            hint="Applied to the basket and the delivery fee together."
          >
            <TextInput
              type="number"
              value={String(s.tax.rates.ON ?? s.tax.default)}
              onChange={(v) =>
                setS({
                  ...s,
                  tax: {
                    ...s.tax,
                    rates: { ...s.tax.rates, ON: parseFloat(v) || 0 },
                    default: parseFloat(v) || 0,
                  },
                })
              }
            />
          </Field>
        </div>
        {/* There was no way to change this from the admin at all, which matters
            most for a business that is not yet registered: charging tax you are
            not registered to collect is worse than not charging it. */}
        <p className="text-xs text-muted">
          Set this to <strong>0</strong> if the business is not yet registered for GST/HST.
          Registration is only required once taxable revenue passes $30,000 over four
          consecutive quarters, and charging HST without a registration number is not
          permitted. Confirm your status with the CRA or your accountant rather than
          assuming 13%.
        </p>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Gifting</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Premium greeting card fee ($)"
            hint="Charged per basket when a customer upgrades from the free Velvéa card to a full-size store card. Set 0 to make it free."
          >
            <TextInput
              type="number"
              value={(s.gifting.premiumCardFeeCents / 100).toFixed(2)}
              onChange={(v) =>
                setS({
                  ...s,
                  gifting: {
                    ...s.gifting,
                    premiumCardFeeCents: Math.max(0, Math.round((parseFloat(v) || 0) * 100)),
                  },
                })
              }
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          The Velvéa message card is always free. This fee only applies to the optional
          upgrade offered on each product page, and it shows on the packing slip so the packer
          knows to use a store card.
        </p>
      </Card>
    </div>
  );
}
