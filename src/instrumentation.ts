/**
 * Runs once when the server boots. A deploy with a missing or placeholder
 * AUTH_SECRET, or Stripe without a webhook secret, should fail here rather
 * than at the first customer checkout.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { assertStartupEnv } = await import("./lib/env");
  assertStartupEnv();
}
