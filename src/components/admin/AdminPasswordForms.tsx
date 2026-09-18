"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/lib/actions/auth";
import { Honeypot } from "@/components/ui/Honeypot";
import { PasswordInput } from "@/components/ui/PasswordInput";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-canvas placeholder:text-canvas/30 focus:border-lilac-deep focus:outline-none";

function Frame({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div
        aria-hidden
        className="pointer-events-none fixed -right-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--grad-iris)" }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo height={28} />
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="mb-6 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Lock className="h-5 w-5 text-lilac-deep" />
            </span>
            <h1 className="mt-4 font-display text-2xl text-canvas">{title}</h1>
            <p className="mt-1 text-sm text-canvas/50">{lede}</p>
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-canvas/40">
          <Link href="/admin/login" className="hover:text-canvas/70">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AdminForgotPassword() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
    null
  );
  const [company, setCompany] = useState("");

  return (
    <Frame title="Reset admin password" lede="We'll email you a single-use link.">
      <form action={action} className="relative space-y-4">
        <Honeypot value={company} onChange={setCompany} />
        <input type="hidden" name="admin" value="1" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-canvas/70">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@velvea.ca"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-red-300">{state.error}</p>
        )}
        {state?.notice && (
          <p className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-canvas/80">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-lilac-deep" />
            {state.notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-canvas px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </Frame>
  );
}

export function AdminResetPassword() {
  return (
    <Suspense>
      <AdminResetInner />
    </Suspense>
  );
}

function AdminResetInner() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, null);

  if (!token) {
    return (
      <Frame title="Invalid link" lede="That reset link is incomplete.">
        <Link
          href="/admin/forgot"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-canvas px-5 py-3 text-sm font-semibold text-charcoal hover:bg-white"
        >
          Request a new link
        </Link>
      </Frame>
    );
  }

  return (
    <Frame title="Choose a new password" lede="At least 8 characters.">
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="admin" value="1" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-canvas/70">New password</label>
          <PasswordInput
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="••••••••"
            tone="dark"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-canvas/70">Confirm password</label>
          <PasswordInput
            name="confirm"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="••••••••"
            tone="dark"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-red-300">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-canvas px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save password"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </Frame>
  );
}
