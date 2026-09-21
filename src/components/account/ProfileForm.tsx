"use client";

import { useActionState } from "react";
import { useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/account";
import type { AccountState } from "@/lib/addresses";
import { accountErrorMessage } from "./accountCopy";

export function ProfileForm({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) {
  const fr = useLocale() === "fr";
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <div className="mb-4">
        <label className="label" htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          disabled
          className="field bg-cream/50 text-ink-soft"
        />
        <p className="mt-1 text-xs text-muted">
          {fr
            ? "L'adresse courriel ne peut pas être modifiée."
            : "Your email address can't be changed."}
        </p>
      </div>
      <div className="mb-4">
        <label className="label" htmlFor="profile-name">{fr ? "Nom" : "Name"}</label>
        <input
          id="profile-name"
          name="name"
          defaultValue={name}
          maxLength={120}
          className="field"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="label" htmlFor="profile-phone">{fr ? "Téléphone" : "Phone"}</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          maxLength={40}
          className="field"
          autoComplete="tel"
          placeholder="613 555 0123"
        />
        <p className="mt-1 text-xs text-muted">
          {fr
            ? "Utilisé pour vous joindre au sujet d'une livraison."
            : "Used to reach you about a delivery."}
        </p>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {accountErrorMessage(state.error, fr)}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-lilac px-3 py-2 text-sm text-ink">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-deep" />
          {fr ? "Profil enregistré." : "Profile saved."}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6">
        {pending ? "…" : fr ? "Enregistrer" : "Save changes"}
      </button>
    </form>
  );
}
