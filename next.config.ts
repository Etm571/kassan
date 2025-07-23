import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    return config;
  },
  experimental: {
    turbo: false as any,
  },
};

export default nextConfig;
