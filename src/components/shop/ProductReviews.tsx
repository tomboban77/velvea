"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Star, ShieldCheck, PenLine, Check } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Honeypot } from "@/components/ui/Honeypot";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/ui/Turnstile";

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
  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: 5,
    title: "",
    body: "",
    email: "",
    // Honeypot: a real visitor never fills this in.
    company: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Turnstile tokens are single-use, so the widget is remounted after a failure.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const fr = locale === "fr";

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form, turnstileToken }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        return;
      }
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? (fr ? "Votre avis n'a pas pu être envoyé." : "Your review couldn't be submitted."));
      resetTurnstile();
    } catch {
      setError(fr ? "Votre avis n'a pas pu être envoyé." : "Your review couldn't be submitted.");
      resetTurnstile();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-line">
      <div className="container-x section-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="caps">{fr ? "Avis" : "Reviews"}</p>
            <h2 className="h-section mt-3">{fr ? "Avis clients" : "Customer reviews"}</h2>
            {count > 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn(i < Math.round(rating) ? "fill-current" : "opacity-25")} />
                  ))}
                </span>
                <span className="text-sm text-ink-soft">
                  {rating.toFixed(1)} / 5 · {count} {fr ? "avis" : "reviews"}
                </span>
              </div>
            ) : (
              !submitted && <p className="mt-3 text-ink-soft">{fr ? "Soyez le premier à donner votre avis." : "Be the first to review this basket."}</p>
            )}
          </div>
          {!submitted && (
            <button onClick={() => setShowForm((s) => !s)} className="btn btn-outline">
              <PenLine /> {fr ? "Écrire un avis" : "Write a review"}
            </button>
          )}
        </div>

        {submitted && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-line bg-white px-5 py-4 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-deep text-white">
              <Check className="h-4 w-4" />
            </span>
            {fr ? "Merci ! Votre avis sera publié après vérification." : "Thank you! Your review will appear once approved."}
          </div>
        )}

        {showForm && (
          <form onSubmit={submit} className="relative mt-6 max-w-3xl rounded-lg border border-line bg-white p-6 sm:p-8">
            <Honeypot value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            {error && <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <p className="label">{fr ? "Votre note" : "Your rating"}</p>
            <div className="mb-5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                  <Star className={cn("h-7 w-7", n <= form.rating ? "fill-star text-star" : "text-line-strong")} />
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder={fr ? "Votre nom" : "Your name"} className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder={fr ? "Ville, province" : "City, province"} className="field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <input placeholder={fr ? "Titre" : "Title"} className="field mt-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea required rows={4} placeholder={fr ? "Votre avis…" : "Your review…"} className="field mt-3 resize-y" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <Turnstile key={turnstileKey} action="review" onToken={setTurnstileToken} className="mt-5" />
            <button
              disabled={busy || (TURNSTILE_ENABLED && !turnstileToken)}
              className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "…" : fr ? "Soumettre" : "Submit review"}
            </button>
          </form>
        )}

        {reviews.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {reviews.map((r) => (
              <figure key={r.id} className="flex flex-col rounded-lg border border-line bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="stars">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="fill-current" />
                    ))}
                  </span>
                  <span className="text-xs text-muted">{formatDate(r.date, fr ? "fr-CA" : "en-CA")}</span>
                </div>
                {r.title && <figcaption className="mt-3 text-[1.05rem] font-semibold text-ink">{r.title}</figcaption>}
                <blockquote className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">&ldquo;{r.body}&rdquo;</blockquote>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.author}</p>
                    {r.location && <p className="text-xs text-muted">{r.location}</p>}
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wider text-violet-deep">
                      <ShieldCheck className="h-3.5 w-3.5" /> {fr ? "Vérifié" : "Verified"}
                    </span>
                  )}
                </div>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
