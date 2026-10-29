import { indexNowKey } from "@/lib/indexnow";

/**
 * The IndexNow key file (see src/lib/indexnow.ts). Search engines fetch it to
 * confirm a ping really came from this host. 404 until INDEXNOW_KEY is set.
 */
export function GET() {
  const key = indexNowKey();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
