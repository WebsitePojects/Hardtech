import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-origin";

export const PUBLIC_SITEMAP_ROUTES = [
  "/",
  "/about",
  "/programs",
  "/enroll",
  "/gallery",
  "/contact",
  "/help",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map((path, index) => ({
    url: siteUrl(path).toString(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
