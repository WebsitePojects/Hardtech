import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as sitemapModule from "../../src/app/sitemap.ts";

const sitemapInterop = sitemapModule.default;
const { programSitemapEntries } = sitemapInterop;

function withPublicOrigin(origin, callback) {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousVercelUrl = process.env.VERCEL_URL;
  process.env.NEXT_PUBLIC_SITE_URL = origin;
  delete process.env.VERCEL_URL;

  try {
    return callback();
  } finally {
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousVercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = previousVercelUrl;
  }
}

test("program sitemap entries expose only valid immutable public slugs", () => {
  withPublicOrigin("https://hardtech.pro", () => {
    const updatedAt = new Date("2026-09-08T00:00:00.000Z");
    const entries = programSitemapEntries([
      { slug: "computer-hardware-servicing", updatedAt },
      { slug: "cellphone-hardware-servicing", updatedAt },
      { slug: "Draft Program", updatedAt },
      { slug: "../private", updatedAt },
    ]);

    assert.deepEqual(entries, [
      {
        url: "https://hardtech.pro/programs/computer-hardware-servicing",
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: "https://hardtech.pro/programs/cellphone-hardware-servicing",
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ]);
  });
});

test("sitemap gets bounded program URLs from the published catalog service, never a direct Program query", async () => {
  const [sitemapSource, serviceSource, repositorySource] = await Promise.all([
    readFile("src/app/sitemap.ts", "utf8"),
    readFile("src/server/services/marketing.service.ts", "utf8"),
    readFile("src/server/repositories/program.repository.ts", "utf8"),
  ]);

  assert.match(sitemapSource, /server\/services\/marketing\.service/);
  assert.match(sitemapSource, /getPublicProgramSitemapRows\(\)/);
  assert.doesNotMatch(sitemapSource, /db\.program/);
  assert.match(sitemapSource, /public-program-sitemap/);
  assert.match(serviceSource, /findPublishedSitemapRows\(PUBLIC_PROGRAM_SITEMAP_LIMIT\)/);
  assert.match(repositorySource, /findPublishedSitemapRows\(take: number\)/);
  assert.match(repositorySource, /where: \{ catalogStatus: "PUBLISHED" \}/);
  assert.match(repositorySource, /select: \{ slug: true, updatedAt: true \}/);
  assert.match(repositorySource, /orderBy: \[\{ sortOrder: "asc" \}, \{ id: "asc" \}\]/);
  assert.match(repositorySource, /take,/);
});
