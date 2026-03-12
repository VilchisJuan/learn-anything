import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@learn-anything/ui", "@learn-anything/content-config", "@learn-anything/visualizations"],
};

export default nextConfig;
