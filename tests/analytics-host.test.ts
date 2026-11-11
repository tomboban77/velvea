import { describe, expect, it } from "vitest";
import { isTrackedHost, isTrackedUrl, trackedHosts } from "@/lib/analytics-host";

/**
 * Analytics must only count the public domain. Vercel preview URLs and the
 * `*.vercel.app` production alias are where the owner checks builds, and
 * those visits were showing up as shoppers in both Vercel Analytics and GA4.
 */
describe("analytics host filter", () => {
  const site = "https://www.velvea.ca";

  it("accepts the www host and the bare apex", () => {
    expect(trackedHosts(site).sort()).toEqual(["velvea.ca", "www.velvea.ca"]);
    expect(isTrackedHost("www.velvea.ca", site)).toBe(true);
    expect(isTrackedHost("VELVEA.CA", site)).toBe(true);
  });

  it("drops Vercel deployment hosts and localhost", () => {
    expect(isTrackedUrl("https://velvea.vercel.app/baskets", site)).toBe(false);
    expect(isTrackedUrl("https://velvea-git-main-tom.vercel.app/", site)).toBe(false);
    expect(isTrackedUrl("https://velvea-abc123.vercel.app/fr", site)).toBe(false);
    expect(isTrackedUrl("http://localhost:3000/", site)).toBe(false);
    expect(isTrackedUrl("not a url", site)).toBe(false);
  });

  it("keeps storefront URLs on the public domain", () => {
    expect(isTrackedUrl("https://www.velvea.ca/baskets?max=9900", site)).toBe(true);
    expect(isTrackedUrl("https://velvea.ca/fr/occasions/birthday", site)).toBe(true);
  });

  it("tracks nothing when the site URL is unset or local", () => {
    expect(trackedHosts("")).toEqual([]);
    expect(trackedHosts(undefined)).toEqual([]);
    expect(trackedHosts("http://localhost:3000")).toEqual([]);
    expect(trackedHosts("garbage")).toEqual([]);
  });
});
