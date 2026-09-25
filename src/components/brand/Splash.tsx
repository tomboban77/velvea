"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/**
 * Marks this browser as greeted. localStorage, not sessionStorage: the welcome
 * is a first-visit moment, so a reload, a second tab or a browser restart must
 * not replay it. Survives until the visitor clears site data. It is per-browser
 * and per-device by nature, so the same person on a phone and a laptop is
 * greeted on each.
 */
const KEY = "velvea_splash";
/** Longest the overlay may survive if its exit animation never reports back. */
const SAFETY = 6000;

/**
 * First-load welcome: the mark on the house plate, a greeting and one line.
 *
 * The decision to show it is made *before the first frame* by the inline script
 * in src/app/layout.tsx, which sets data-splash="1" on <html>. A returning
 * visitor, anyone on prefers-reduced-motion, and the admin panel never see a
 * flash, because .splash is display:none until that attribute exists and the
 * attribute is decided before paint, not after hydration. Every image is a CSS
 * background, and browsers do not fetch the backgrounds of an element with no
 * box — so the loads that are never seen are never paid for either.
 *
 * CSS owns the clock. The whole sequence, hold and exit included, is one
 * timeline in globals.css anchored to first paint. This component never runs a
 * timer against it: a JS timer starts at hydration, which is a different and
 * later moment, and the two drifting apart is exactly how you get an overlay
 * that fades out on the CSS clock and then flashes back in on the JS one.
 * All this does is
 *   - skip to the exit on a tap, key or scroll (data-splash="out"),
 *   - clear the attribute once the exit animation says it has finished.
 *
 * It is also careful not to *undo* anything on cleanup. React runs effects
 * twice in development, so a cleanup that removed the attribute would kill the
 * welcome at hydration — abruptly, with no fade.
 *
 * The page underneath is real markup the whole time. The overlay is fixed and
 * decorative (aria-hidden), so crawlers and screen readers get the page, not
 * the curtain.
 */
export function Splash() {
  const t = useTranslations("splash");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    // Set before paint, or not at all. Anything else means: not our turn.
    if (root.getAttribute("data-splash") !== "1") return;
    const el = ref.current;

    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Private mode or blocked storage: greet again next load, never crash.
    }

    let safety = 0;
    const finish = () => {
      window.clearTimeout(safety);
      root.removeAttribute("data-splash");
    };

    // Both exits are velvea-splash-out*; the rise-away on .splash-inner and the
    // entrance animations on the plate and the mark bubble up here too, hence
    // the target check.
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName.startsWith("velvea-splash-out")) finish();
    };

    // A welcome that cannot be dismissed is a door that sticks.
    const dismiss = () => {
      if (root.getAttribute("data-splash") !== "1") return;
      root.setAttribute("data-splash", "out");
    };

    const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    for (const e of events) window.addEventListener(e, dismiss, { passive: true });
    el?.addEventListener("animationend", onEnd);
    // Backgrounded tabs and cancelled animations can swallow animationend.
    safety = window.setTimeout(finish, SAFETY);

    return () => {
      window.clearTimeout(safety);
      for (const e of events) window.removeEventListener(e, dismiss);
      el?.removeEventListener("animationend", onEnd);
    };
  }, []);

  return (
    <div className="splash" ref={ref} aria-hidden="true">
      <div className="splash-plate" />
      <div className="splash-inner">
        <div className="splash-mark-wrap">
          <div className="splash-mark" />
          {/* light passing over the foil, once — masked to the letterforms */}
          <div className="splash-sheen" />
        </div>
        <span className="splash-rule" />
        {/* The greeting is the small voice and the line is the loud one, which
            is the opposite of the hero below — there the serif is the headline
            and the sans is the paragraph. Keeps the two from reading as the
            same slide twice. */}
        <p className="splash-greeting">{t("greeting")}</p>
        <p className="splash-line">{t("line")}</p>
      </div>
    </div>
  );
}
