import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: require.resolve("./empty-module.ts")
      },
    },
  },
};

export default nextConfig;
