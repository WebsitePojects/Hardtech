import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { siteUrl } from "@/lib/site-origin";

const ANNOUNCEMENT_SITEMAP_LIMIT = 1_000;
const ANNOUNCEMENT_SITEMAP_REVALIDATE_SECONDS = 300;
const PROGRAM_SITEMAP_REVALIDATE_SECONDS = 300;
const announcementIdPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const programSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type AnnouncementSitemapRow = {
  id: string;
  updatedAt: Date;
};

type ProgramSitemapRow = {
  slug: string;
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

/**
 * Dynamic program entries deliberately use the marketing service rather than
 * querying Program directly. That boundary guarantees sitemap URLs mirror the
 * catalog's published-only visibility rule. That service returns only the
 * route identifier and timestamp with a database-level cap, so this route
 * never loads full catalog records or unbounded data into its cache.
 */
const getCachedProgramSitemapRows = unstable_cache(
  async (): Promise<ProgramSitemapRow[]> => {
    const { getPublicProgramSitemapRows } = await import("@/server/services/marketing.service");
    return getPublicProgramSitemapRows();
  },
  ["public-program-sitemap"],
  {
    tags: ["public-program-catalog"],
    revalidate: PROGRAM_SITEMAP_REVALIDATE_SECONDS,
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

/** Only valid, immutable slugs from the published catalog become public URLs. */
export function programSitemapEntries(
  rows: readonly ProgramSitemapRow[],
): MetadataRoute.Sitemap {
  return rows
    .filter((row) => programSlugPattern.test(row.slug))
    .map((row) => ({
      url: siteUrl(`/programs/${encodeURIComponent(row.slug)}`).toString(),
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticSitemapEntries();
  let programEntries: MetadataRoute.Sitemap = [];
  let announcementEntries: MetadataRoute.Sitemap = [];

  try {
    programEntries = programSitemapEntries(await getCachedProgramSitemapRows());
  } catch (error) {
    // Keep durable static and announcement routes available if the catalog
    // source is temporarily unavailable. Do not log program identifiers.
    console.error("[sitemap] program lookup failed", error);
  }

  try {
    announcementEntries = announcementSitemapEntries(await getCachedAnnouncementSitemapRows());
  } catch (error) {
    // Search crawlers should still receive durable marketing and program routes
    // during a transient announcement lookup failure. Do not log identifiers
    // or announcement content from this public endpoint.
    console.error("[sitemap] announcement lookup failed", error);
  }

  return [...staticEntries, ...programEntries, ...announcementEntries];
}
