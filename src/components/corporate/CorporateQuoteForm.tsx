"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check, Loader2, ArrowRight } from "lucide-react";

export function CorporateQuoteForm() {
  const fr = useLocale() === "fr";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [f, setF] = useState({
    company: "", contactName: "", email: "", phone: "",
    budget: "", quantity: "", occasion: "", message: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[1.75rem] border border-line bg-shell p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-iris-soft">
          <Check className="h-7 w-7 text-violet-deep" />
        </div>
        <h2 className="mt-5 font-display text-2xl">
          {fr ? "Merci ! Nous vous répondrons sous peu." : "Thank you — we'll be in touch shortly."}
        </h2>
        <p className="mt-2 text-ink-soft">
          {fr
            ? "Notre équipe corporative prépare votre proposition sur mesure."
            : "Our corporate team is preparing a tailored proposal for you."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-line bg-shell p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{fr ? "Entreprise" : "Company"} *</label>
          <input required className="field" value={f.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Personne-ressource" : "Contact name"} *</label>
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
          <label className="label">{fr ? "Quantité estimée" : "Estimated quantity"}</label>
          <input placeholder={fr ? "ex. 25 paniers" : "e.g. 25 baskets"} className="field" value={f.quantity} onChange={(e) => set("quantity", e.target.value)} />
        </div>
        <div>
          <label className="label">{fr ? "Budget par panier" : "Budget per basket"}</label>
          <input placeholder={fr ? "ex. 100–150 $" : "e.g. $100–150"} className="field" value={f.budget} onChange={(e) => set("budget", e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <label className="label">{fr ? "Occasion" : "Occasion"}</label>
        <input placeholder={fr ? "Fêtes, appréciation client…" : "Holiday, client appreciation…"} className="field" value={f.occasion} onChange={(e) => set("occasion", e.target.value)} />
      </div>
      <div className="mt-4">
        <label className="label">{fr ? "Détails" : "Tell us more"}</label>
        <textarea rows={4} className="field resize-y" value={f.message} onChange={(e) => set("message", e.target.value)}
          placeholder={fr ? "Échéancier, personnalisation, adresses de livraison…" : "Timeline, branding, delivery addresses…"} />
      </div>
      {state === "error" && (
        <p className="mt-3 text-sm text-danger">{fr ? "Une erreur est survenue. Réessayez." : "Something went wrong. Please try again."}</p>
      )}
      <button disabled={state === "loading"} className="btn btn-gold btn-lg mt-6 w-full sm:w-auto">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {fr ? "Envoyer la demande" : "Request a quote"}
        {state !== "loading" && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
