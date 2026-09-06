import type { Metadata } from "next";

const DEFAULT_SITE_ORIGIN = "http://localhost:3000";
const BRAND_NAME = "HardTech IT Corp";
const BRAND_IMAGE = "/images/brand/hardtech-logo.png";

type SiteOriginEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_URL?: string;
};

function originFromValue(value: string, label: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid http(s) URL`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} must use http or https`);
  }

  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.pathname !== "" && parsed.pathname !== "/")
  ) {
    throw new Error(`${label} must contain an origin only, without a path or credentials`);
  }

  return new URL(parsed.origin);
}

function vercelOrigin(value: string): URL {
  const candidate = value.includes("://") ? value : `https://${value}`;
  return originFromValue(candidate, "VERCEL_URL");
}

/** Resolve the public deployment origin used by metadata, crawlers, and links. */
export function getSiteOrigin(
  env: SiteOriginEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return originFromValue(explicit, "NEXT_PUBLIC_SITE_URL");

  const vercel = env.VERCEL_URL?.trim();
  if (vercel) return vercelOrigin(vercel);

  return new URL(DEFAULT_SITE_ORIGIN);
}

export function siteUrl(path: string, env?: SiteOriginEnv): URL {
  if (typeof path !== "string") {
    throw new TypeError("site URL path must be a string");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = getSiteOrigin(env);
  const resolved = new URL(normalizedPath, origin);

  // A protocol-relative path (including one smuggled through a backslash) can
  // make URL resolve against a different host. Metadata and sitemap URLs must
  // stay on the validated deployment origin.
  if (resolved.origin !== origin.origin) {
    throw new Error("site URL path must stay on the configured origin");
  }

  return resolved;
}

export type SiteMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

/** Build page metadata with a route-specific canonical and social URL. */
export function createSiteMetadata({
  title,
  description,
  path,
  noIndex = false,
}: SiteMetadataOptions): Metadata {
  const canonical = siteUrl(path).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: BRAND_NAME,
      locale: "en_PH",
      type: "website",
      images: [{ url: BRAND_IMAGE, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [BRAND_IMAGE],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            noimageindex: true,
            googleBot: {
              index: false,
              follow: false,
              noimageindex: true,
            },
          },
        }
      : {}),
  };
}
