import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
          },
          // HSTS only takes effect for HTTPS responses, which keeps local HTTP
          // development usable while enforcing HTTPS after a production visit.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },

  /**
   * Pin the workspace root. Without this, Turbopack walks up and finds
   * C:\Users\Win10\package-lock.json, picks the home directory as the root, and
   * traces the wrong file tree — which breaks standalone output and deploys.
   * In Next 16 `turbopack` is top level, no longer under `experimental`.
   */
  turbopack: {
    root: path.resolve(__dirname),
  },

  experimental: {
    serverActions: {
      // Default is 1 MB. `/enroll`'s payment-proof upload accepts up to a
      // 5 MB image (src/server/schemas/enrollment.schema.ts) and arrives as
      // multipart/form-data through this exact Server Action boundary — at
      // the 1 MB default, any proof over roughly 700 KB would have been
      // rejected by the framework before submitEnrollmentAction ever ran.
      // 6 MB leaves headroom for multipart boundary/field overhead per the
      // Next docs' own rule of thumb (node_modules/next/dist/docs/01-app/
      // 03-api-reference/05-config/01-next-config-js/serverActions.md).
      bodySizeLimit: "6mb",
    },
  },

  images: {
    /**
     * The only remote raster in the design source. `domains` is deprecated in
     * Next 16 — `remotePatterns` is the supported form.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
