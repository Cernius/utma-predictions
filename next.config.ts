import type { NextConfig } from "next";

/**
 * GitHub Pages serves project sites from /<repo>, so the deploy workflow passes
 * the repo name in as NEXT_PUBLIC_BASE_PATH. It stays empty for local dev and
 * for a user/org page served from the domain root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Pages has no image optimizer, and the fighter portraits are already sized.
  images: { unoptimized: true },
  // Emits out/<route>/index.html, which Pages can serve without rewrites.
  trailingSlash: true,
};

export default nextConfig;
