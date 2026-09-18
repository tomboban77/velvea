"use client";

import { useActionState, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, MailCheck } from "lucide-react";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/lib/actions/auth";
import { Honeypot } from "@/components/ui/Honeypot";
import { PasswordInput } from "@/components/ui/PasswordInput";

function Shell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-x flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{lede}</p>
        </div>
        {children}
        {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}

/** "I forgot my password" — always reports the same outcome. */
export function ForgotPasswordForm() {
  const locale = useLocale();
  const fr = locale === "fr";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
    null
  );
  const [company, setCompany] = useState("");

  return (
    <Shell
      title={fr ? "Mot de passe oublié" : "Forgot your password"}
      lede={
        fr
          ? "Entrez votre adresse courriel et nous vous enverrons un lien de réinitialisation."
          : "Enter your email and we'll send you a reset link."
      }
      footer={
        <>
          {fr ? "Vous vous en souvenez ?" : "Remembered it?"}{" "}
          <Link href="/account/login" className="font-semibold text-ink hover:text-violet">
            {fr ? "Se connecter" : "Sign in"}
          </Link>
        </>
      }
    >
      <form
        action={formAction}
        className="relative rounded-lg border border-line bg-white p-6 sm:p-8"
      >
        <Honeypot value={company} onChange={setCompany} />
        <input type="hidden" name="locale" value={locale} />
        <label className="label">Email</label>
        <input name="email" type="email" required className="field" autoComplete="email" />

        {state?.error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
        )}
        {state?.notice && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-lilac px-3 py-2 text-sm text-ink">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-deep" />
            {state.notice}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full">
          {pending ? "…" : fr ? "Envoyer le lien" : "Send reset link"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </Shell>
  );
}

/** "Choose a new password" — the token arrives in the emailed link. */
export function ResetPasswordForm({ token }: { token: string }) {
  const fr = useLocale() === "fr";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    null
  );

  if (!token) {
    return (
      <Shell
        title={fr ? "Lien invalide" : "Invalid link"}
        lede={
          fr
            ? "Ce lien de réinitialisation est incomplet. Demandez-en un nouveau."
            : "That reset link is incomplete. Please request a new one."
        }
      >
        <div className="text-center">
          <Link href="/account/forgot" className="btn btn-primary">
            {fr ? "Demander un nouveau lien" : "Request a new link"}
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title={fr ? "Nouveau mot de passe" : "Choose a new password"}
      lede={
        fr ? "Au moins 8 caractères." : "At least 8 characters."
      }
    >
      <form action={formAction} className="rounded-lg border border-line bg-white p-6 sm:p-8">
        <input type="hidden" name="token" value={token} />
        <div className="mb-4">
          <label className="label">{fr ? "Mot de passe" : "New password"}</label>
          <PasswordInput
            name="password"
            required
            minLength={8}
            className="field"
            autoComplete="new-password"
            showLabel={fr ? "Afficher le mot de passe" : "Show password"}
            hideLabel={fr ? "Masquer le mot de passe" : "Hide password"}
          />
        </div>
        <div>
          <label className="label">{fr ? "Confirmer" : "Confirm password"}</label>
          <PasswordInput
            name="confirm"
            required
            minLength={8}
            className="field"
            autoComplete="new-password"
            showLabel={fr ? "Afficher le mot de passe" : "Show password"}
            hideLabel={fr ? "Masquer le mot de passe" : "Hide password"}
          />
        </div>

        {state?.error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full">
          {pending ? "…" : fr ? "Enregistrer" : "Save password"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </Shell>
  );
}
