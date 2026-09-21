"use client";

import { useActionState } from "react";
import { useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/account";
import type { AccountState } from "@/lib/addresses";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { accountErrorMessage } from "./accountCopy";

export function ChangePasswordForm() {
  const fr = useLocale() === "fr";
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    changePasswordAction,
    null
  );
  const showLabel = fr ? "Afficher le mot de passe" : "Show password";
  const hideLabel = fr ? "Masquer le mot de passe" : "Hide password";

  return (
    <form
      action={formAction}
      // Clearing the fields after a successful change keeps the old and new
      // secrets out of the page once they are no longer needed.
      key={state?.ok ? "done" : "editing"}
      className="rounded-lg border border-line bg-white p-6 sm:p-8"
    >
      <div className="mb-4">
        <label className="label">{fr ? "Mot de passe actuel" : "Current password"}</label>
        <PasswordInput
          name="current"
          required
          className="field"
          autoComplete="current-password"
          showLabel={showLabel}
          hideLabel={hideLabel}
        />
      </div>
      <div className="mb-4">
        <label className="label">{fr ? "Nouveau mot de passe" : "New password"}</label>
        <PasswordInput
          name="password"
          required
          minLength={8}
          className="field"
          autoComplete="new-password"
          showLabel={showLabel}
          hideLabel={hideLabel}
        />
        <p className="mt-1 text-xs text-muted">{fr ? "Au moins 8 caractères." : "At least 8 characters."}</p>
      </div>
      <div>
        <label className="label">{fr ? "Confirmer le nouveau mot de passe" : "Confirm new password"}</label>
        <PasswordInput
          name="confirm"
          required
          minLength={8}
          className="field"
          autoComplete="new-password"
          showLabel={showLabel}
          hideLabel={hideLabel}
        />
      </div>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {accountErrorMessage(state.error, fr)}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-lilac px-3 py-2 text-sm text-ink">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-deep" />
          {fr ? "Mot de passe mis à jour." : "Password updated."}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6">
        {pending ? "…" : fr ? "Changer le mot de passe" : "Change password"}
      </button>
    </form>
  );
}
