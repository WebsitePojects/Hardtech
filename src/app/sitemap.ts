import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { siteUrl } from "@/lib/site-origin";

const ANNOUNCEMENT_SITEMAP_LIMIT = 1_000;
const ANNOUNCEMENT_SITEMAP_REVALIDATE_SECONDS = 300;
const announcementIdPattern = /^[a-zA-Z0-9_-]{1,80}$/;

type AnnouncementSitemapRow = {
  id: string;
  updatedAt: Date;
};

export const PUBLIC_SITEMAP_ROUTES = [
  "/",
  "/about",
  "/programs",
  "/enroll",
  "/gallery",
  "/contact",
  "/help",
] as const;

export function staticSitemapEntries(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map((path, index) => ({
    url: siteUrl(path).toString(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}

/**
 * Announcement rows are public notices by schema definition. Select only the
 * route identifier and timestamp so the sitemap cache cannot retain author or
 * announcement-body data. The cap keeps a malformed or unusually large table
 * from turning one crawler request into an unbounded database response.
 */
const getCachedAnnouncementSitemapRows = unstable_cache(
  async (): Promise<AnnouncementSitemapRow[]> => {
    // Keep database configuration out of the module graph for static sitemap
    // tooling and tests. This still runs only on the server when the dynamic
    // public entries are requested.
    const { db } = await import("@/server/db");
    return db.announcement.findMany({
      select: { id: true, updatedAt: true },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: ANNOUNCEMENT_SITEMAP_LIMIT,
    });
  },
  ["public-announcement-sitemap"],
  {
    // Admin announcement mutations already call updateTag("dashboard").
    // Pair that existing invalidation path with a short expiry as a safe
    // recovery path if a future writer does not carry the tag forward.
    tags: ["dashboard", "public-announcements"],
    revalidate: ANNOUNCEMENT_SITEMAP_REVALIDATE_SECONDS,
  },
);

export function announcementSitemapEntries(
  rows: readonly AnnouncementSitemapRow[],
): MetadataRoute.Sitemap {
  return rows
    .filter((row) => announcementIdPattern.test(row.id))
    .map((row) => ({
      url: siteUrl(`/announcements/${encodeURIComponent(row.id)}`).toString(),
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticSitemapEntries();

  try {
    return [...staticEntries, ...announcementSitemapEntries(await getCachedAnnouncementSitemapRows())];
  } catch (error) {
    // Search crawlers should still receive the durable marketing routes during
    // a transient database failure. Do not log identifiers or announcement
    // content from this public endpoint.
    console.error("[sitemap] announcement lookup failed", error);
    return staticEntries;
  }
}
