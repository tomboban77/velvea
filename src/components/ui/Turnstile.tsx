"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

/**
 * Cloudflare Turnstile widget for the public forms.
 *
 * Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so local
 * development and any environment without keys keep working. The server side
 * (`verifyTurnstile`) likewise only enforces tokens once TURNSTILE_SECRET_KEY
 * exists, so both keys must be set together in production.
 *
 * Usage: hold the token in state, render <Turnstile onToken={setToken} />
 * inside the form, send `turnstileToken` with the request, and disable submit
 * while TURNSTILE_ENABLED && !token. Tokens are single-use: remount the widget
 * (change its `key`) after a failed submission so the visitor gets a fresh one.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_ENABLED = Boolean(SITE_KEY);

type RenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  language?: string;
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "compact" | "flexible";
  theme?: "light" | "dark" | "auto";
  action?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: RenderOptions) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function Turnstile({
  onToken,
  action,
  appearance = "interaction-only",
  theme = "light",
  className,
}: {
  /** Called with a fresh token, or null when it expires or errors. */
  onToken: (token: string | null) => void;
  /** Optional label visible in Cloudflare analytics, e.g. "newsletter". */
  action?: string;
  appearance?: RenderOptions["appearance"];
  theme?: RenderOptions["theme"];
  className?: string;
}) {
  const locale = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Keep the latest callback without re-rendering the widget when it changes.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY || !container.current) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: SITE_KEY,
          language: locale.startsWith("fr") ? "fr" : "en",
          appearance,
          theme,
          size: "flexible",
          action,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch((err) => {
        // Cloudflare unreachable: leave the token null. The server fails open
        // on network errors of its own, but we cannot mint a token here.
        console.error(err);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // Widget already gone.
        }
      }
      widgetId.current = null;
    };
  }, [locale, appearance, theme, action]);

  if (!SITE_KEY) return null;
  return <div ref={container} className={className} />;
}
