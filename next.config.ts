import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: ["images.unsplash.com"],
  },
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default nextConfig;
