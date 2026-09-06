"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      {state === "done" ? (
        <div className="flex items-center gap-3 rounded-full bg-iris-soft px-5 py-4 text-sm font-medium text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-iris text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
          {t("success")}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
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
