/**
 * Client-side translation of the ways a Server Action call can fail *before*
 * the action itself runs.
 *
 * The dashboard is a single long-lived tab. When a deploy lands while it is
 * open, the action ids baked into the loaded bundle no longer exist on the
 * server and React rejects with "Server Action ... was not found on the
 * server" — which reads like a bug in the form, not a stale page.
 */
export const STALE_ACTION_MESSAGE =
  "This page was loaded before the site was last deployed, so the save never reached the server. Reload and save again.";

export function isStaleActionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return (
    /server action/i.test(message) &&
    /(was not found|failed to find)/i.test(message)
  );
}

/** A message worth showing next to a save button. */
export function actionErrorMessage(err: unknown): string {
  if (isStaleActionError(err)) return STALE_ACTION_MESSAGE;
  // fetch() rejects with a TypeError when the request never completed.
  if (err instanceof TypeError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return err instanceof Error && err.message ? err.message : "Something went wrong.";
}
