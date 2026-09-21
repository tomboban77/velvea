"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/** Admin-side fallback for an uncaught error. Shows the digest so it can be found in the Vercel logs. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream">
        <AlertTriangle className="h-7 w-7 text-violet-deep" />
      </div>
      <h1 className="mt-5 font-display text-2xl">This admin page hit an error</h1>
      <p className="mt-3 text-sm text-ink-soft">
        The action may not have completed. Try again, and if it repeats check the Vercel logs for the
        reference below.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted">digest: {error.digest}</p>}
      {error.message && <p className="mt-2 text-xs text-muted">{error.message}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-charcoal"
        >
          Try again
        </button>
        <Link href="/admin" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-cream">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
