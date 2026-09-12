"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Star, ShieldCheck, PenLine, Check } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

type Review = {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  date: string;
};

export function ProductReviews({
  productId,
  rating,
  count,
  reviews,
}: {
  productId: string;
  rating: number;
  count: number;
  reviews: Review[];
}) {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", rating: 5, title: "", body: "" });
  const [busy, setBusy] = useState(false);

  const fr = locale === "fr";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-line bg-cream/40">
      <div className="container-x py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">
              {fr ? "Avis clients" : "Customer Reviews"}
            </h2>
            {count > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-violet">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < Math.round(rating) ? "fill-current" : "opacity-30")} />
                  ))}
                </div>
                <span className="text-sm text-ink-soft">
                  {rating.toFixed(1)} · {count} {fr ? "avis" : "reviews"}
                </span>
              </div>
            )}
          </div>
          {!submitted && (
            <button onClick={() => setShowForm((s) => !s)} className="btn btn-outline btn-sm">
              <PenLine className="h-4 w-4" /> {fr ? "Écrire un avis" : "Write a review"}
            </button>
          )}
        </div>

        {submitted && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-shell px-5 py-4 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-iris text-white">
              <Check className="h-4 w-4" />
            </span>
            {fr
              ? "Merci ! Votre avis sera publié après vérification."
              : "Thank you! Your review will appear once approved."}
          </div>
        )}

        {showForm && (
          <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-shell p-6">
            <div className="mb-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  aria-label={`${n} stars`}
                >
                  <Star className={cn("h-6 w-6", n <= form.rating ? "fill-gold text-gold" : "text-line-strong")} />
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder={fr ? "Votre nom" : "Your name"} className="field"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder={fr ? "Ville, province" : "City, province"} className="field"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <input placeholder={fr ? "Titre" : "Title"} className="field mt-3"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea required rows={4} placeholder={fr ? "Votre avis…" : "Your review…"} className="field mt-3 resize-y"
              value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <button disabled={busy} className="btn btn-primary btn-sm mt-4">
              {busy ? "…" : fr ? "Soumettre" : "Submit review"}
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="flex flex-col rounded-2xl border border-line bg-shell p-6">
                <div className="flex items-center justify-between">
                  <div className="flex text-violet">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted">{formatDate(r.date, fr ? "fr-CA" : "en-CA")}</span>
                </div>
                {r.title && <figcaption className="mt-3 font-display text-lg">{r.title}</figcaption>}
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  &ldquo;{r.body}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.author}</p>
                    {r.location && <p className="text-xs text-muted">{r.location}</p>}
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-violet-deep">
                      <ShieldCheck className="h-3.5 w-3.5" /> {fr ? "Vérifié" : "Verified"}
                    </span>
                  )}
                </div>
              </figure>
            ))}
          </div>
        ) : (
          !submitted && (
            <p className="mt-8 text-sm text-muted">
              {fr ? "Soyez le premier à donner votre avis." : "Be the first to review this basket."}
            </p>
          )
        )}
      </div>
    </section>
  );
}
