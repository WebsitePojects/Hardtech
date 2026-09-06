import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as robotsModule from "../../src/app/robots.ts";
import * as sitemapModule from "../../src/app/sitemap.ts";
import {
  createSiteMetadata,
  getSiteOrigin,
  siteUrl,
} from "../../src/lib/site-origin.ts";

// tsx loads these Next file-convention modules through a CommonJS interop
// wrapper when this test itself is ESM.
const sitemapInterop = sitemapModule.default;
const robotsInterop = robotsModule.default;
const sitemap = sitemapInterop.default ?? sitemapInterop;
const robots = robotsInterop.default ?? robotsInterop;
const { PUBLIC_SITEMAP_ROUTES } = sitemapInterop;

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

test("site origin prefers a validated explicit origin and supports Vercel previews", () => {
  assert.equal(
    getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://hardtech.pro/" }).toString(),
    "https://hardtech.pro/",
  );
  assert.equal(
    getSiteOrigin({ VERCEL_URL: "hardtech-preview.vercel.app" }).toString(),
    "https://hardtech-preview.vercel.app/",
  );
  assert.equal(getSiteOrigin({}).toString(), "http://localhost:3000/");
});

test("site origin rejects paths, credentials, and non-http protocols", () => {
  assert.throws(
    () => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://hardtech.pro/app" }),
    /origin only/,
  );
  assert.throws(
    () => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://user:pass@hardtech.pro" }),
    /origin only/,
  );
  assert.throws(
    () => getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }),
    /http or https/,
  );
});

test("site URL paths cannot escape the configured origin", () => {
  withPublicOrigin("https://hardtech.pro", () => {
    assert.throws(() => {
      // URL treats both spellings as protocol-relative host syntax.
      siteUrl("//evil.example");
    }, /configured origin/);
    assert.throws(() => {
      siteUrl("/\\\\evil.example");
    }, /configured origin/);
  });
});

test("page metadata uses its own canonical and Open Graph URL", () => {
  withPublicOrigin("https://hardtech.pro", () => {
    const metadata = createSiteMetadata({
      title: "About — HardTech IT Corp",
      description: "About HardTech IT Corp.",
      path: "/about",
    });

    assert.equal(metadata.alternates?.canonical, "https://hardtech.pro/about");
    assert.equal(metadata.openGraph?.url, "https://hardtech.pro/about");
    assert.equal(metadata.robots, undefined);
  });
});

test("sitemap contains only known public static routes", () => {
  withPublicOrigin("https://hardtech.pro", () => {
    const entries = sitemap();
    assert.deepEqual(
      entries.map((entry) => entry.url),
      PUBLIC_SITEMAP_ROUTES.map((path) => `https://hardtech.pro${path}`),
    );
    assert.equal(entries.some((entry) => entry.url.includes("verify")), false);
    assert.equal(entries.some((entry) => entry.url.includes("dashboard")), false);
    assert.equal(entries.some((entry) => entry.url.endsWith("/announcements/unknown")), false);
    assert.equal(entries.every((entry) => entry.url.startsWith("https://hardtech.pro/")), true);
  });
});

test("robots advertises the same origin and blocks private route families", () => {
  withPublicOrigin("https://hardtech.pro", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const disallowed = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : [],
    );

    assert.equal(result.sitemap, "https://hardtech.pro/sitemap.xml");
    for (const route of ["/api/", "/dashboard", "/login", "/forum", "/communities", "/messages", "/verify/"]) {
      assert.equal(disallowed.includes(route), true, `missing ${route}`);
    }
  });
});

test("auth, app, dashboard, and certificate verification stay out of indexes", async () => {
  for (const path of [
    "src/app/(auth)/layout.tsx",
    "src/app/(app)/layout.tsx",
    "src/app/(dashboard)/layout.tsx",
  ]) {
    const source = await readFile(path, "utf8");
    assert.match(source, /index:\s*false/);
    assert.match(source, /follow:\s*false/);
  }

  const verifyPage = await readFile("src/app/(marketing)/verify/[code]/page.tsx", "utf8");
  assert.match(verifyPage, /noIndex:\s*true/);
});

test("footer has no fake phone or placeholder external links", async () => {
  const footer = await readFile("src/components/layout/footer.tsx", "utf8");
  assert.equal(footer.includes('href="#"'), false);
  assert.equal(footer.includes("tel:1234567890"), false);
  assert.equal(footer.includes("Follow on Facebook"), false);
  assert.equal(footer.includes("primaryOffice.email"), true);
});
