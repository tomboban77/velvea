"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Last-resort boundary: only reached when the root layout itself throws, so
 * it must render its own <html> and cannot use next-intl, fonts or the design
 * system. Kept deliberately plain and dependency-free.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fbf8f2", color: "#211b15", fontFamily: "Georgia, serif" }}>
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <p style={{ letterSpacing: 4, fontSize: 20, fontWeight: 700, color: "#b0894e" }}>VELVÉA</p>
          <h1 style={{ fontSize: 28, margin: "24px 0 12px" }}>Something went wrong · Un problème est survenu</h1>
          <p style={{ color: "#514a40", lineHeight: 1.6 }}>
            The page couldn&apos;t load. Please try again in a moment.
            <br />
            La page n&apos;a pas pu se charger. Veuillez réessayer dans un instant.
          </p>
          {error.digest && <p style={{ fontSize: 12, color: "#8a8072" }}>Reference: {error.digest}</p>}
          <p style={{ marginTop: 28 }}>
            <button
              onClick={reset}
              style={{
                background: "#211b15",
                color: "#f7f2e8",
                border: 0,
                borderRadius: 999,
                padding: "12px 22px",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Try again · Réessayer
            </button>
          </p>
          <p style={{ marginTop: 16 }}>
            <Link href="/" style={{ color: "#b0894e" }}>
              velvea.ca
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
