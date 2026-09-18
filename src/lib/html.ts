/**
 * HTML escaping for values interpolated into email templates.
 * Customer names, addresses, gift messages and inquiry text are all attacker-
 * controlled — they must never reach a template unescaped.
 */
const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** Escape, then turn newlines into <br> — for free-text blocks like gift messages. */
export function escapeHtmlMultiline(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}
