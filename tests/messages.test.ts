import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import en from "../messages/en.json";
import fr from "../messages/fr.json";

/**
 * next-intl throws when a component asks for a key the active locale does not
 * have, so a missing French string is not a cosmetic fallback — it is a crashed
 * page. Checkout moved off inline `fr ? … : …` ternaries and onto the catalogue,
 * which means the catalogue is now load-bearing for the one page that takes
 * money. These tests keep the two files in step and verify that every key the
 * components actually ask for exists in both.
 */

/** The catalogue holds strings, nested objects and arrays (the FAQ item list). */
type Node = string | Node[] | { [k: string]: Node };

/** Every leaf in a catalogue, flattened to "section.key" form; array entries
 *  are indexed ("faq.items.0.q") so the FAQ lists are compared item by item. */
function flatten(node: Node, prefix = ""): string[] {
  if (typeof node === "string") return prefix ? [prefix] : [];
  const entries: [string, Node][] = Array.isArray(node)
    ? node.map((v, i) => [String(i), v])
    : Object.entries(node);
  return entries.flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

const enTree = en as unknown as Node;
const frTree = fr as unknown as Node;
const enKeys = flatten(enTree);
const frKeys = flatten(frTree);

describe("message catalogues", () => {
  it("EN and FR contain exactly the same keys", () => {
    expect(frKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !frKeys.includes(k))).toEqual([]);
  });

  it("has no empty strings (an empty FR value renders as blank, not as English)", () => {
    const empties = flatten(frTree).filter((k) => resolve(frTree, k) === "");
    expect(empties).toEqual([]);
  });

  it("keeps ICU placeholders identical between locales", () => {
    // Only top-level arguments count. A naive /\{(\w+)/ also matches the bodies
    // of ICU plural branches ("{est trop perissable}"), which legitimately
    // differ between languages, so depth is tracked and nested braces skipped.
    const placeholders = (s: string) => {
      const found: string[] = [];
      let depth = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === "}") depth--;
        else if (s[i] === "{") {
          if (depth === 0) {
            const name = /^\{(\w+)/.exec(s.slice(i));
            if (name) found.push(name[1]);
          }
          depth++;
        }
      }
      return found.sort();
    };
    for (const key of enKeys) {
      expect(placeholders(resolve(frTree, key)), `placeholders differ for ${key}`).toEqual(
        placeholders(resolve(enTree, key))
      );
    }
  });
});

function resolve(tree: Node, path: string): string {
  return path.split(".").reduce<Node>((acc, part) => {
    return Array.isArray(acc) ? acc[Number(part)] : (acc as { [k: string]: Node })[part];
  }, tree) as string;
}

/**
 * Scrapes `useTranslations("ns")` + `tc("key")` pairs out of the components and
 * checks each resolved key exists. This is deliberately a text scan rather than
 * a render: it needs no DOM and it catches the exact failure mode, a key that
 * was renamed in the catalogue but not in the JSX.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(full);
    return e.name.endsWith(".tsx") || e.name.endsWith(".ts") ? [full] : [];
  });
}

describe("checkout copy resolves", () => {
  const src = readFileSync("src/components/checkout/CheckoutForm.tsx", "utf8");

  it("every tc(...) key exists in both catalogues", () => {
    const used = [...src.matchAll(/\btc\(\s*"([^"]+)"/g)].map((m) => `checkoutForm.${m[1]}`);
    expect(used.length).toBeGreaterThan(30); // the refactor replaced 42 call sites
    for (const key of used) {
      expect(enKeys, `missing EN ${key}`).toContain(key);
      expect(frKeys, `missing FR ${key}`).toContain(key);
    }
  });

  it("no bilingual ternaries remain outside money formatting", () => {
    // `fr ? "fr-CA" : "en-CA"` picks a number format, not copy, and stays.
    const ternaries = [...src.matchAll(/fr \? "([^"]*)"/g)].map((m) => m[1]);
    expect(ternaries.filter((v) => v !== "fr-CA")).toEqual([]);
  });
});

describe("storefront components", () => {
  it("every scoped translator key in checkout components exists", () => {
    for (const file of sourceFiles("src/components/checkout")) {
      const text = readFileSync(file, "utf8");
      const ns = text.match(/useTranslations\("([^"]+)"\)/);
      if (!ns) continue;
      for (const m of text.matchAll(/\btc\(\s*"([^"]+)"/g)) {
        expect(enKeys, `${file}: missing ${ns[1]}.${m[1]}`).toContain(`${ns[1]}.${m[1]}`);
      }
    }
  });
});
