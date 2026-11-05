import { describe, expect, it } from "vitest";

import { htmlToText, sanitizeHtml } from "@/lib/sanitize";

/**
 * Guide bodies are rendered with dangerouslySetInnerHTML, so the sanitiser is
 * the only thing between a STAFF account and script on the storefront. It
 * once let `<img src=x onerror=alert(1) a">` straight through: the unbalanced
 * quote stopped the tag pattern from matching, and an unmatched tag was left
 * as it was. The invariant tested here is stronger than "this payload is
 * gone": every "<" in the output must start a tag the sanitiser rebuilt from
 * its allow-list, in exactly the shape it writes them.
 */

const REBUILT_TAG =
  /^<\/?(p|br|hr|h2|h3|h4|strong|b|em|i|u|s|ul|ol|li|blockquote|figure|figcaption|a|img|table|thead|tbody|tr|th|td|code|pre|span|div)((?: [a-z]+="[^"]*")*)( \/)?>$/;

function expectOnlyRebuiltMarkup(html: string) {
  // Quoted attribute values may legitimately contain "<" or ">", so walk the
  // output with the same quote-aware shape the sanitiser emits.
  const tags = html.match(/<\/?[a-z0-9]+(?: [a-z]+="[^"]*")*(?: \/)?>/g) ?? [];
  for (const tag of tags) {
    expect(tag).toMatch(REBUILT_TAG);
    // Check attribute names, not raw text: an escaped `&quot; onclick=` inside
    // a value is inert and must not count as a handler.
    for (const [, attr, value] of tag.matchAll(/ ([a-z]+)="([^"]*)"/g)) {
      expect(attr).not.toMatch(/^on/);
      if (attr === "href" || attr === "src") expect(value).toMatch(/^(https?:|mailto:|tel:|\/|#)/i);
    }
  }
  const text = html.replace(/<\/?[a-z0-9]+(?: [a-z]+="[^"]*")*(?: \/)?>/g, "");
  expect(text).not.toContain("<");
}

const PAYLOADS: Record<string, string> = {
  "unbalanced double quote": `<p>ok</p><img src=x onerror=alert(1) a"><p>after</p>`,
  "unbalanced single quote": `<p>ok</p><img src=x onerror=alert(1) a'><p>after</p>`,
  "unbalanced quote, no closing bracket": `<img src=x onerror=alert(1) a"`,
  "tag split by newlines": `<img\nsrc=x\nonerror=alert(1)\n>`,
  "tag name split by newline": `<im\ng src=x onerror=alert(1)>`,
  "uppercase script": `<SCRIPT>alert(1)</SCRIPT><ScRiPt >alert(2)</sCrIpT >`,
  "unclosed script": `<script src=//evil.example/x.js`,
  "svg onload": `<svg/onload=alert(1)>`,
  "svg with script": `<svg><script>alert(1)</script></svg>`,
  "math mutation": `<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>`,
  "javascript href": `<a href="javascript:alert(1)">x</a>`,
  "javascript href, entity encoded": `<a href="&#106;avascript:alert(1)">x</a>`,
  "javascript href, hex entity scheme": `<a href="javascript&#x3A;alert(1)">x</a>`,
  "javascript href, tab inside": `<a href="java\tscript:alert(1)">x</a>`,
  "javascript href, leading space and case": `<a href="  JaVaScRiPt:alert(1)">x</a>`,
  "javascript href, control char": `<a href="\u0001javascript:alert(1)">x</a>`,
  "data src": `<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">`,
  "empty comment trick": `<!--><img src=x onerror=alert(1)>-->`,
  "short comment trick": `<!---><img src=x onerror=alert(1)>`,
  "unterminated comment": `<!-- <img src=x onerror=alert(1)>`,
  "bogus comment": `<!x><img src=x onerror=alert(1)>`,
  "processing instruction": `<?xml ?><img src=x onerror=alert(1)>`,
  "backtick attribute value": "<img src=`x` onerror=`alert(1)`>",
  "backtick inside quoted value": '<img src="https://x/`" onerror=alert(1)>',
  "attribute breakout via quote": `<a title='x" onmouseover="alert(1)' href="/ok">x</a>`,
  "iframe srcdoc": `<iframe srcdoc="<script>alert(1)</script>"></iframe>`,
  "nested tag rebuild": `<<script>script>alert(1)<</script>/script>`,
  "slash separators": `<img/src="x"/onerror=alert(1)>`,
  "disallowed tag with handler": `<details open ontoggle=alert(1)>`,
  "style attribute": `<p style="background:url(javascript:alert(1))">x</p>`,
};

describe("sanitizeHtml neutralises known bypasses", () => {
  for (const [name, payload] of Object.entries(PAYLOADS)) {
    it(name, () => {
      const out = sanitizeHtml(payload);
      expectOnlyRebuiltMarkup(out);
      // Sanitising is idempotent: stored content is re-sanitised on every save.
      expect(sanitizeHtml(out)).toBe(out);
    });
  }

  it("turns the unbalanced-quote tag into inert text", () => {
    const out = sanitizeHtml(`<p>ok</p><img src=x onerror=alert(1) a"><p>after</p>`);
    expect(out).toBe(`<p>ok</p>&lt;img src=x onerror=alert(1) a"><p>after</p>`);
  });

  it("drops scheme-less and script URLs but keeps the element", () => {
    expect(sanitizeHtml(`<a href="javascript:alert(1)">x</a>`)).toBe("<a>x</a>");
    expect(sanitizeHtml(`<a href="&#106;avascript:alert(1)">x</a>`)).toBe("<a>x</a>");
  });
});

describe("sanitizeHtml keeps legitimate content", () => {
  it("keeps allowed tags and attributes", () => {
    const html =
      `<h2>Picking a basket</h2><p>Start with <strong>who</strong> it is for, ` +
      `then <a href="https://www.velvea.ca/shop" title="Shop">browse</a>.</p>` +
      `<ul><li>One</li><li>Two</li></ul>` +
      `<img src="https://res.cloudinary.com/x/y.jpg" alt="A basket" width="800" height="600" loading="lazy" />`;
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("keeps relative, anchor, mailto and tel links", () => {
    for (const href of ["/fr/shop", "#faq", "mailto:hi@example.com", "tel:+19055550100"]) {
      expect(sanitizeHtml(`<a href="${href}">x</a>`)).toBe(`<a href="${href}">x</a>`);
    }
  });

  it("adds rel to links that open a new tab", () => {
    expect(sanitizeHtml(`<a href="https://x.example" target="_blank">x</a>`)).toBe(
      `<a href="https://x.example" target="_blank" rel="noopener noreferrer">x</a>`
    );
  });

  it("keeps entities and text containing < and >", () => {
    expect(sanitizeHtml("<p>Tea &amp; biscuits, 3 < 5 and 7 > 2</p>")).toBe(
      "<p>Tea &amp; biscuits, 3 &lt; 5 and 7 > 2</p>"
    );
    expect(sanitizeHtml("<p>&lt;not a tag&gt; &eacute;t&eacute;</p>")).toBe(
      "<p>&lt;not a tag&gt; &eacute;t&eacute;</p>"
    );
  });

  it("normalises tag case and quoting", () => {
    expect(sanitizeHtml(`<P>Hi<BR><A HREF='/x'>x</A></P>`)).toBe(`<p>Hi<br /><a href="/x">x</a></p>`);
  });

  it("keeps > inside a quoted attribute value", () => {
    expect(sanitizeHtml(`<a title="a > b" href="/x">x</a>`)).toBe(`<a title="a > b" href="/x">x</a>`);
  });

  it("drops comments and disallowed tags but keeps their text", () => {
    expect(sanitizeHtml(`<p>a<!-- note -->b<font color="red">c</font></p>`)).toBe("<p>abc</p>");
  });

  it("htmlToText strips the rebuilt markup", () => {
    expect(htmlToText(`<h2>Title</h2><p>Body <em>text</em></p>`)).toBe("Title Body text");
  });
});
