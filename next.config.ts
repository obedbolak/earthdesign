import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS domains (use cautiously)
      },
      {
        protocol: 'http',
        hostname: '**', // Allows all HTTP domains (use cautiously)
      },
    ],
    // Alternative: specify exact domains if you know them
    domains: [
      'images.unsplash.com',
      // Add your backend domain here, e.g.:
      // 'your-backend-domain.com',
      // 'api.earthdesign.cm',
    ],
  },
};

export default nextConfig;