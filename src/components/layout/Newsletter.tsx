"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Honeypot } from "@/components/ui/Honeypot";
import { cn } from "@/lib/utils";

export function Newsletter({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [company, setCompany] = useState("");
  /** Set when the confirm/unsubscribe links bounce the visitor back here. */
  const [outcome, setOutcome] = useState<string | null>(null);
  const dark = tone === "dark";

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
        <div className={cn("flex items-center gap-3 rounded-md px-5 py-4 text-sm font-medium", dark ? "bg-white/10 text-white" : "bg-lilac text-ink")}>
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", dark ? "bg-white text-violet-deep" : "bg-violet-deep text-white")}>
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
            className={cn("field min-h-[52px] flex-1", dark && "border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:border-white focus:shadow-none")}
            aria-label={t("placeholder")}
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className={cn("btn min-h-[52px] shrink-0", dark ? "btn-light" : "btn-primary")}
          >
            {state === "loading" ? "…" : t("cta")}
            <ArrowRight />
          </button>
        </form>
      )}
      <p className={cn("mt-3 text-xs", dark ? "text-white/55" : "text-muted")}>
        {state === "error" ? <span className={dark ? "text-gold-pale" : "text-danger"}>{t("error")}</span> : t("consent")}
      </p>
    </div>
  );
}
