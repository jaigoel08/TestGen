import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Increase body size limit for APK uploads
    middlewareClientMaxBodySize: "100mb",
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
