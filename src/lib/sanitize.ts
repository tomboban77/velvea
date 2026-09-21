/**
 * Allow-list sanitiser for article bodies.
 *
 * Guide bodies are rendered with dangerouslySetInnerHTML, so anything a STAFF
 * account can save becomes script on the storefront. Rather than trying to
 * spot dangerous markup, we drop every tag and attribute that is not on the
 * list below, and run it on save so stored content is already clean.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "h2", "h3", "h4",
  "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li",
  "blockquote", "figure", "figcaption",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "code", "pre", "span", "div",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

/** Tags whose entire contents must go, not just the tag itself. */
const VOID_CONTENT_TAGS = ["script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math"];

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

function safeUrl(value: string): string | null {
  const trimmed = value.trim().replace(/[\u0000-\u001f]/g, "");
  if (!trimmed) return null;
  return SAFE_URL.test(trimmed) ? trimmed : null;
}

function sanitizeAttributes(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return "";
  const out: string[] = [];
  const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(raw))) {
    const name = match[1].toLowerCase();
    if (!allowed.has(name)) continue;
    let value = match[2];
    if (value.startsWith('"') || value.startsWith("'")) value = value.slice(1, -1);
    if (name === "href" || name === "src") {
      const url = safeUrl(value);
      if (!url) continue;
      value = url;
    }
    out.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "a") {
    const hasTarget = out.some((a) => a.startsWith("target="));
    if (hasTarget && !out.some((a) => a.startsWith("rel="))) {
      out.push('rel="noopener noreferrer"');
    }
  }
  return out.length ? " " + out.join(" ") : "";
}

/** Strip everything outside the allow-list. Safe to run repeatedly. */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  let html = input;

  // Remove dangerous elements along with their contents.
  for (const tag of VOID_CONTENT_TAGS) {
    // String.raw keeps the regex escapes intact: in a plain template literal
    // "\b" is a backspace and "\s" is a bare "s", which silently made these
    // patterns match nothing and left script text visible in the article.
    html = html.replace(new RegExp(String.raw`<${tag}\b[^>]*>[\s\S]*?</${tag}\s*>`, "gi"), "");
    html = html.replace(new RegExp(String.raw`</?${tag}\b[^>]*>`, "gi"), "");
  }
  // Comments can hide conditional-comment script in some clients.
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  return html.replace(
    /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
    (_full, closing: string, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;
      const selfClosing = tag === "br" || tag === "hr" || tag === "img";
      return `<${tag}${sanitizeAttributes(tag, attrs)}${selfClosing ? " /" : ""}>`;
    }
  );
}

/** Plain-text preview of sanitised HTML (meta descriptions, search snippets). */
export function htmlToText(input: string): string {
  return sanitizeHtml(input)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
