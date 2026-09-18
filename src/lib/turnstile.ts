import "server-only";
import { clientIp } from "./rate-limit";

/**
 * Cloudflare Turnstile verification for the three public forms.
 *
 * Disabled until TURNSTILE_SECRET_KEY is set, so local development and the
 * existing forms keep working; once the key is present a missing or invalid
 * token is rejected. Network failures fail open — a Cloudflare outage must not
 * take the contact form down — but an explicit "invalid" never passes.
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = await clientIp();
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[turnstile] verification endpoint returned", res.status);
      return true;
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification unreachable:", err);
    return true;
  }
}
