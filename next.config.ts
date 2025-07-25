import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    return config;
  },
 
};

module.exports = {
  allowedDevOrigins: ['kassan.etm571.com', 'ws.kassan.etm571.com',],
}

export default nextConfig;
