import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shop shows nothing third-party and needs no images, so keep the build plain.
  poweredByHeader: false,
  // Builds run from the project root (locally and on Vercel); don't let a lockfile in a parent
  // directory make Turbopack guess a different root.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
