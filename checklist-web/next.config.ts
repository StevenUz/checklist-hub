import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcrypt"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, Accept",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: path.join(process.cwd(), ".."),
  },
};

export default nextConfig;
