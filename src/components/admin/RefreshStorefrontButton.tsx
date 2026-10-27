"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { refreshStorefront } from "@/lib/actions/admin";
import { actionErrorMessage } from "@/lib/action-error";

export function RefreshStorefrontButton() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className={message.ok ? "text-sm text-muted" : "text-sm text-danger"}>{message.text}</span>
      )}
      <button
        onClick={() =>
          start(async () => {
            setMessage(null);
            try {
              await refreshStorefront();
              setMessage({ ok: true, text: "Storefront refreshed." });
            } catch (e) {
              setMessage({ ok: false, text: actionErrorMessage(e) });
            }
          })
        }
        disabled={pending}
        title="Use after a script import or a direct database change. Admin saves refresh on their own."
        className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Refresh storefront
      </button>
    </div>
  );
}
