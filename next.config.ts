import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Diperlukan untuk Docker deployment (multi-stage build)
  output: "standalone",
  // Izinkan Cloudflare Tunnel origin untuk HMR WebSocket saat development
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kendariweb-minio.q00ohl.easypanel.host",
      },
      {
        protocol: "http",
        hostname: "kendariweb-minio.q00ohl.easypanel.host",
      }
    ],
  },
};

export default nextConfig;
