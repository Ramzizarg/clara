import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb", // or "20mb" if you want more
    },
  },
};

export default nextConfig;