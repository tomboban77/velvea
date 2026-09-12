"use client";

import { useActionState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { customerLoginAction, customerRegisterAction, type AuthState } from "@/lib/actions/auth";

export function CustomerAuth({ mode }: { mode: "login" | "register" }) {
  const fr = useLocale() === "fr";
  const action = mode === "login" ? customerLoginAction : customerRegisterAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  return (
    <div className="container-x flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl">
            {mode === "login" ? (fr ? "Bon retour" : "Welcome back") : (fr ? "Créer un compte" : "Create your account")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "login"
              ? fr ? "Connectez-vous pour suivre vos commandes." : "Sign in to track your orders."
              : fr ? "Enregistrez vos adresses et suivez vos commandes." : "Save your addresses and track your orders."}
          </p>
        </div>

        <form action={formAction} className="rounded-[1.5rem] border border-line bg-shell p-6 sm:p-8">
          {mode === "register" && (
            <div className="mb-4">
              <label className="label">{fr ? "Nom" : "Name"}</label>
              <input name="name" className="field" autoComplete="name" />
            </div>
          )}
          <div className="mb-4">
            <label className="label">Email</label>
            <input name="email" type="email" required className="field" autoComplete="email" />
          </div>
          <div>
            <label className="label">{fr ? "Mot de passe" : "Password"}</label>
            <input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} className="field" autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {mode === "register" && <p className="mt-1 text-xs text-muted">{fr ? "Au moins 8 caractères." : "At least 8 characters."}</p>}
          </div>

          {state?.error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full">
            {pending ? "…" : mode === "login" ? (fr ? "Se connecter" : "Sign in") : (fr ? "Créer le compte" : "Create account")}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "login" ? (
            <>{fr ? "Pas de compte ?" : "No account?"} <Link href="/account/register" className="font-semibold text-ink hover:text-violet">{fr ? "S'inscrire" : "Create one"}</Link></>
          ) : (
            <>{fr ? "Déjà un compte ?" : "Already have an account?"} <Link href="/account/login" className="font-semibold text-ink hover:text-violet">{fr ? "Se connecter" : "Sign in"}</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
