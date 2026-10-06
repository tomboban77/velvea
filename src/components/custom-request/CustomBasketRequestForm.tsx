"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Honeypot } from "@/components/ui/Honeypot";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/ui/Turnstile";
import { OCCASIONS, HOLIDAYS, labelFor } from "@/lib/nav";
import { addStoreDays, storeYmd } from "@/lib/dates";
import {
  CUSTOM_REQUEST_LIMITS,
  NEEDED_BY_MAX_DAYS,
  validateCustomRequest,
  type CustomRequestErrorCode,
  type CustomRequestField,
} from "@/lib/custom-request";

type Fields = Record<CustomRequestField, string>;
type Errors = Partial<Record<CustomRequestField, CustomRequestErrorCode>>;

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  products: "",
  occasion: "",
  budget: "",
  neededBy: "",
  deliveryArea: "",
};

/** Focus order for the first error, matching the order fields appear on screen. */
const ORDER: CustomRequestField[] = [
  "products",
  "occasion",
  "budget",
  "neededBy",
  "deliveryArea",
  "name",
  "email",
  "phone",
];

export function CustomBasketRequestForm() {
  const t = useTranslations("customRequest");
  const locale = useLocale();
  const [f, setF] = useState<Fields>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  // Errors appear after the first submit attempt, then update as the customer
  // types, so nobody is scolded for a field they have not reached yet.
  const [attempted, setAttempted] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ email: string; phone: string } | null>(null);
  // Turnstile tokens are single-use, so the widget is remounted after a failure.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const today = useMemo(() => storeYmd(), []);
  const maxDate = useMemo(() => addStoreDays(today, NEEDED_BY_MAX_DAYS), [today]);
  const occasionSuggestions = useMemo(
    () => Array.from(new Set([...OCCASIONS, ...HOLIDAYS].map((o) => labelFor(o, locale)))),
    [locale]
  );

  function set(k: CustomRequestField, v: string) {
    const next = { ...f, [k]: v };
    setF(next);
    if (attempted) {
      const res = validateCustomRequest(next, today);
      setErrors(res.ok ? {} : res.errors);
    }
  }

  function focusFirst(errs: Errors) {
    const first = ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#cr-${first}`)?.focus();
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setFormError(null);
    const res = validateCustomRequest(f, today);
    if (!res.ok) {
      setErrors(res.errors);
      setFormError(t("errorSummary"));
      focusFirst(res.errors);
      return;
    }
    setErrors({});
    setState("loading");
    try {
      const r = await fetch("/api/custom-basket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, locale, website, turnstileToken }),
      });
      if (r.ok) {
        setSent({ email: res.data.email, phone: res.data.phone });
        setState("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const body = (await r.json().catch(() => ({}))) as { error?: string; message?: string; fields?: Errors };
      if (body.fields) {
        setErrors(body.fields);
        setFormError(t("errorSummary"));
        focusFirst(body.fields);
      } else if (body.error === "rateLimited" && body.message) {
        setFormError(body.message);
      } else if (body.error === "verification") {
        setFormError(t("errorVerification"));
      } else {
        setFormError(t("errorGeneric"));
      }
      setState("idle");
      resetTurnstile();
    } catch {
      setFormError(t("errorGeneric"));
      setState("idle");
      resetTurnstile();
    }
  }

  function startOver() {
    setF(EMPTY);
    setErrors({});
    setAttempted(false);
    setSent(null);
    setFormError(null);
    resetTurnstile();
    setState("idle");
  }

  if (state === "done" && sent) {
    const body =
      sent.email && sent.phone
        ? t("doneBodyBoth", { email: sent.email, phone: sent.phone })
        : sent.email
          ? t("doneBodyEmail", { email: sent.email })
          : t("doneBodyPhone", { phone: sent.phone });
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center sm:p-10" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lilac">
          <Check className="h-7 w-7 text-violet-deep" />
        </div>
        <h2 className="mt-5 font-display text-2xl balance">{t("doneTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft pretty">{body}</p>
        <p className="mt-2 text-sm text-muted">{t("doneNote")}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/baskets" className="btn btn-gold">
            {t("doneBrowse")} <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" onClick={startOver} className="btn btn-outline">
            {t("doneAnother")}
          </button>
        </div>
      </div>
    );
  }

  const err = (k: CustomRequestField) => (errors[k] ? t(`errors.${errors[k]}`) : null);
  /** Props wiring a field to its label, hint and error for screen readers. */
  const a11y = (k: CustomRequestField, hint?: string) => {
    const ids = [hint ?? "", errors[k] ? `cr-${k}-error` : ""].filter(Boolean).join(" ");
    return {
      id: `cr-${k}`,
      name: k,
      "aria-invalid": errors[k] ? true : undefined,
      "aria-describedby": ids || undefined,
    };
  };
  const errorText = (k: CustomRequestField) =>
    errors[k] ? (
      <p id={`cr-${k}-error`} className="mt-1.5 text-sm text-danger">
        {err(k)}
      </p>
    ) : null;
  const optional = <span className="font-normal text-muted"> ({t("optional")})</span>;
  const required = (
    <span className="text-danger" aria-hidden>
      {" "}*
    </span>
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="relative rounded-lg border border-line bg-white p-6 sm:p-8">
      <Honeypot name="website" value={website} onChange={setWebsite} />

      {/* 1 · What goes in */}
      <fieldset>
        <legend className="font-display text-xl text-ink">{t("sectionBasket")}</legend>
        <div className="mt-4">
          <label htmlFor="cr-products" className="label">
            {t("productsLabel")}
            {required}
            <span className="sr-only"> ({t("required")})</span>
          </label>
          <p id="cr-products-hint" className="-mt-1 mb-2 text-sm text-ink-soft">
            {t("productsHint")}
          </p>
          <textarea
            {...a11y("products", "cr-products-hint")}
            required
            rows={6}
            maxLength={CUSTOM_REQUEST_LIMITS.products}
            className="field resize-y"
            placeholder={t("productsPlaceholder")}
            value={f.products}
            onChange={(e) => set("products", e.target.value)}
          />
          <div className="mt-1 flex items-start justify-between gap-4">
            {errorText("products")}
            <p className="ml-auto mt-1.5 shrink-0 text-xs text-muted" aria-live="polite">
              {t("charCount", { count: f.products.length, max: CUSTOM_REQUEST_LIMITS.products })}
            </p>
          </div>
        </div>
      </fieldset>

      {/* 2 · About the gift */}
      <fieldset className="mt-8 border-t border-line pt-7">
        <legend className="float-left w-full font-display text-xl text-ink">{t("sectionGift")}</legend>
        <div className="clear-both grid gap-4 pt-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cr-occasion" className="label">
              {t("occasionLabel")}
              {optional}
            </label>
            <input
              {...a11y("occasion")}
              list="cr-occasion-list"
              maxLength={CUSTOM_REQUEST_LIMITS.occasion}
              className="field"
              placeholder={t("occasionPlaceholder")}
              value={f.occasion}
              onChange={(e) => set("occasion", e.target.value)}
            />
            <datalist id="cr-occasion-list">
              {occasionSuggestions.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
            {errorText("occasion")}
          </div>
          <div>
            <label htmlFor="cr-budget" className="label">
              {t("budgetLabel")}
              {optional}
            </label>
            <input
              {...a11y("budget")}
              maxLength={CUSTOM_REQUEST_LIMITS.budget}
              className="field"
              placeholder={t("budgetPlaceholder")}
              value={f.budget}
              onChange={(e) => set("budget", e.target.value)}
            />
            {errorText("budget")}
          </div>
          <div>
            <label htmlFor="cr-neededBy" className="label">
              {t("neededByLabel")}
              {optional}
            </label>
            <input
              {...a11y("neededBy", "cr-neededBy-hint")}
              type="date"
              min={today}
              max={maxDate}
              className="field"
              value={f.neededBy}
              onChange={(e) => set("neededBy", e.target.value)}
            />
            <p id="cr-neededBy-hint" className="mt-1.5 text-xs text-muted">
              {t("neededByHint")}
            </p>
            {errorText("neededBy")}
          </div>
          <div>
            <label htmlFor="cr-deliveryArea" className="label">
              {t("deliveryAreaLabel")}
              {optional}
            </label>
            <input
              {...a11y("deliveryArea")}
              autoComplete="postal-code"
              maxLength={CUSTOM_REQUEST_LIMITS.deliveryArea}
              className="field"
              placeholder={t("deliveryAreaPlaceholder")}
              value={f.deliveryArea}
              onChange={(e) => set("deliveryArea", e.target.value)}
            />
            {errorText("deliveryArea")}
          </div>
        </div>
      </fieldset>

      {/* 3 · Contact */}
      <fieldset className="mt-8 border-t border-line pt-7">
        <legend className="float-left w-full font-display text-xl text-ink">{t("sectionContact")}</legend>
        <p id="cr-contact-hint" className="clear-both pt-2 text-sm text-ink-soft">
          {t("contactHint")}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cr-name" className="label">
              {t("nameLabel")}
              {required}
              <span className="sr-only"> ({t("required")})</span>
            </label>
            <input
              {...a11y("name")}
              required
              autoComplete="name"
              maxLength={CUSTOM_REQUEST_LIMITS.name}
              className="field"
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errorText("name")}
          </div>
          <div>
            <label htmlFor="cr-email" className="label">
              {t("emailLabel")}
            </label>
            <input
              {...a11y("email", "cr-contact-hint")}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={CUSTOM_REQUEST_LIMITS.email}
              className="field"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errorText("email")}
          </div>
          <div>
            <label htmlFor="cr-phone" className="label">
              {t("phoneLabel")}
            </label>
            <input
              {...a11y("phone", "cr-contact-hint")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={CUSTOM_REQUEST_LIMITS.phone}
              className="field"
              placeholder={t("phonePlaceholder")}
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errorText("phone")}
          </div>
        </div>
      </fieldset>

      {formError && (
        <p className="mt-6 rounded-md bg-cream px-4 py-3 text-sm text-danger" role="alert">
          {formError}
        </p>
      )}

      <Turnstile key={turnstileKey} action="custom_basket" onToken={setTurnstileToken} className="mt-6" />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={state === "loading" || (TURNSTILE_ENABLED && !turnstileToken)}
          className="btn btn-gold btn-lg w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("sending")}
            </>
          ) : (
            <>
              {t("submit")} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="text-sm text-muted">{t("noPayment")}</p>
      </div>
    </form>
  );
}
