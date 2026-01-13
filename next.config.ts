import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.xperia.pt',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
