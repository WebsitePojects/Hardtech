import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/login",
        "/forgot-password",
        "/forum",
        "/communities",
        "/messages",
        "/verify/",
      ],
    },
    sitemap: siteUrl("/sitemap.xml").toString(),
  };
}
