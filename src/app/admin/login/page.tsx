"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { adminLoginAction } from "@/lib/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const [state, action, pending] = useActionState(adminLoginAction, null);
  const next = useSearchParams().get("from") || "/admin";

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
            <h1 className="mt-4 font-display text-2xl text-canvas">Admin sign in</h1>
            <p className="mt-1 text-sm text-canvas/50">
              Manage products, orders and content.
            </p>
          </div>

          <form action={action} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-canvas/70">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-canvas placeholder:text-canvas/30 focus:border-lilac-deep focus:outline-none"
                placeholder="you@velvea.ca"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-canvas/70">
                Password
              </label>
              <PasswordInput
                name="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-canvas placeholder:text-canvas/30 focus:border-lilac-deep focus:outline-none"
                placeholder="••••••••"
                tone="dark"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-red-300">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-canvas px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-5 text-center text-sm">
            <Link href="/admin/forgot" className="text-canvas/50 hover:text-canvas/80">
              Forgot your password?
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-canvas/40">
          Velvea · Mississauga, Ontario
        </p>
      </div>
    </div>
  );
}
