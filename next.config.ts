import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sweph"],
  outputFileTracingIncludes: {
    "/api/generate": ["./vendor/ephe/**/*", "./node_modules/sweph/**/*"],
  },
};

export default nextConfig;
