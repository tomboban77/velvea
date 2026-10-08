"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Honeypot } from "@/components/ui/Honeypot";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/ui/Turnstile";

export function BrandPartnerForm() {
  const fr = useLocale() === "fr";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  // Turnstile tokens are single-use, so the widget is remounted after a failure.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [f, setF] = useState({
    brand: "", contactName: "", email: "", phone: "",
    website: "", category: "", location: "", pricing: "", message: "",
    // Honeypot: a real visitor never fills this in.
    company: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, locale: fr ? "fr" : "en", turnstileToken }),
      });
      setState(res.ok ? "done" : "error");
      if (!res.ok) resetTurnstile();
    } catch {
      setState("error");
      resetTurnstile();
    }
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-line bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lilac">
          <Check className="h-7 w-7 text-violet-deep" />
        </div>
        <h2 className="mt-5 font-display text-2xl">
          {fr ? "Merci ! Nous avons bien reçu votre proposition." : "Thank you — we've received your note."}
        </h2>
        <p className="mt-2 text-ink-soft">
          {fr
            ? "Nous lisons chaque proposition et vous écrirons d'ici une semaine si vos produits conviennent."
            : "We read every submission and will be in touch within a week if your products are a fit."}
        </p>
      </div>
    );
  }

  return (
    <form id="partner-form" onSubmit={submit} className="relative rounded-lg border border-line bg-white p-6 sm:p-8">
      <Honeypot name="company" value={f.company} onChange={(v) => set("company", v)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{fr ? "Marque" : "Brand name"} *</label>
          <input required className="field" value={f.brand} onChange={(e) => set("brand", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Votre nom" : "Your name"} *</label>
          <input required className="field" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input required type="email" className="field" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Téléphone" : "Phone"}</label>
          <input className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Site web ou boutique" : "Website or shop"}</label>
          <input placeholder={fr ? "Site, Instagram, Etsy…" : "Site, Instagram, Etsy…"} className="field" value={f.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Basée à" : "Based in"}</label>
          <input placeholder={fr ? "ex. Mississauga, ON" : "e.g. Mississauga, ON"} className="field" value={f.location} onChange={(e) => set("location", e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <label className="label">{fr ? "Ce que vous fabriquez" : "What you make"}</label>
        <input placeholder={fr ? "Chocolat, thé, bougies, soins…" : "Chocolate, tea, candles, skincare…"} className="field" value={f.category} onChange={(e) => set("category", e.target.value)} />
      </div>
      <div className="mt-4">
        <label className="label">{fr ? "Prix de gros et minimums" : "Wholesale pricing and minimums"}</label>
        <input placeholder={fr ? "ex. 6 $ l'unité, minimum 24" : "e.g. $6 per unit, minimum 24"} className="field" value={f.pricing} onChange={(e) => set("pricing", e.target.value)} />
      </div>
      <div className="mt-4">
        <label className="label">{fr ? "Parlez-nous de vos produits" : "Tell us about your products"}</label>
        <textarea rows={4} className="field resize-y" value={f.message} onChange={(e) => set("message", e.target.value)}
          placeholder={fr ? "Vos produits phares, durée de conservation, emballage, étiquettes bilingues…" : "Best sellers, shelf life, packaging, bilingual labels…"} />
      </div>
      {state === "error" && (
        <p className="mt-3 text-sm text-danger">{fr ? "Une erreur est survenue. Réessayez." : "Something went wrong. Please try again."}</p>
      )}
      <Turnstile key={turnstileKey} action="partners" onToken={setTurnstileToken} className="mt-6" />
      <button
        disabled={state === "loading" || (TURNSTILE_ENABLED && !turnstileToken)}
        className="btn btn-gold btn-lg mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {fr ? "Envoyer" : "Send"}
        {state !== "loading" && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
