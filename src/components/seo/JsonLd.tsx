import { jsonLdString, type JsonLdValue } from "@/lib/seo";

/**
 * Structured-data script. All JSON-LD goes through here so the "<" escaping in
 * `jsonLdString` is never forgotten on a new page.
 */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
