import Link from "next/link";

// Root fallback 404 (renders inside the root <html>/<body> layout).
export default function RootNotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4rem 1.5rem", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
      <p style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "4rem", color: "#d9cdb6", margin: 0 }}>404</p>
      <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "1.75rem", marginTop: "0.5rem" }}>Page not found</h1>
      <Link href="/" style={{ marginTop: "1.5rem", background: "#211b15", color: "#f7f2e8", padding: "0.8rem 1.5rem", borderRadius: "999px", textDecoration: "none", fontWeight: 600 }}>
        Go home
      </Link>
    </div>
  );
}
