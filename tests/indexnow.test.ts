import { describe, expect, it } from "vitest";
import { indexNowKey, indexNowPayload } from "@/lib/indexnow";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("IndexNow", () => {
  it("only accepts a key the protocol allows", () => {
    expect(indexNowKey(env({}))).toBeNull();
    expect(indexNowKey(env({ INDEXNOW_KEY: "short" }))).toBeNull();
    expect(indexNowKey(env({ INDEXNOW_KEY: "has spaces in it" }))).toBeNull();
    expect(indexNowKey(env({ INDEXNOW_KEY: " 0f8b2c1e-4d7a-4e3b-9a61-2c5d8e7f9a10 " }))).toBe(
      "0f8b2c1e-4d7a-4e3b-9a61-2c5d8e7f9a10"
    );
  });

  it("announces both locales, once each, with the key file location", () => {
    const p = indexNowPayload(["/products/rose", "/products/rose", "/guides"], "abcd1234", "https://www.velvea.ca");
    expect(p).toEqual({
      host: "www.velvea.ca",
      key: "abcd1234",
      keyLocation: "https://www.velvea.ca/indexnow.txt",
      urlList: [
        "https://www.velvea.ca/products/rose",
        "https://www.velvea.ca/fr/products/rose",
        "https://www.velvea.ca/guides",
        "https://www.velvea.ca/fr/guides",
      ],
    });
  });
});
