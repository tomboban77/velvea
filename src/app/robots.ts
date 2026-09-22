import type { MetadataRoute } from "next";
import { buildRobots, siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteOrigin());
}
