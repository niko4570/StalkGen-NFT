import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["replicate.delivery"],
  },
  // Set correct outputFileTracingRoot for monorepo
  outputFileTracingRoot: resolve("./"),
};

export default nextConfig;
