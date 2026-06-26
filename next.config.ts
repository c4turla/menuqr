import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Diperlukan untuk Docker deployment (multi-stage build)
  output: "standalone",
};

export default nextConfig;
