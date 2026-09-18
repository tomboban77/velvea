"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Honeypot } from "@/components/ui/Honeypot";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [company, setCompany] = useState("");
  /** Set when the confirm/unsubscribe links bounce the visitor back here. */
  const [outcome, setOutcome] = useState<string | null>(null);

  // Read from the URL rather than useSearchParams: this block lives in the
  // root layout, and useSearchParams would opt every page out of static
  // rendering.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("newsletter");
    if (value) setOutcome(value);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, company }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const payload = (await res.json().catch(() => null)) as { status?: string } | null;
      setOutcome(payload?.status === "already-subscribed" ? "already" : null);
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  // Double opt-in: subscribing only sends a confirmation email, so the copy
  // must not claim the person is on the list yet.
  const banner =
    outcome === "confirmed"
      ? t("confirmed")
      : outcome === "unsubscribed"
      ? t("unsubscribed")
      : outcome === "invalid"
      ? t("invalidLink")
      : outcome === "already"
      ? t("alreadySubscribed")
      : state === "done"
      ? t("success")
      : null;

  return (
    <div>
      {banner ? (
        <div className="flex items-center gap-3 rounded-2xl bg-iris-soft px-5 py-4 text-sm font-medium text-ink">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iris text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
          {banner}
        </div>
      ) : (
        <form onSubmit={submit} className="relative flex flex-col gap-2 sm:flex-row">
          <Honeypot value={company} onChange={setCompany} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            className="field !rounded-full flex-1"
            aria-label={t("placeholder")}
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="btn btn-primary shrink-0 disabled:opacity-60"
          >
            {state === "loading" ? "…" : t("cta")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-muted">
        {state === "error" ? (
          <span className="text-danger">{t("error")}</span>
        ) : (
          t("consent")
        )}
      </p>
    </div>
  );
}
