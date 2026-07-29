import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Pin the workspace root. Without this, Turbopack walks up and finds
   * C:\Users\Win10\package-lock.json, picks the home directory as the root, and
   * traces the wrong file tree — which breaks standalone output and deploys.
   * In Next 16 `turbopack` is top level, no longer under `experimental`.
   */
  turbopack: {
    root: path.resolve(__dirname),
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
