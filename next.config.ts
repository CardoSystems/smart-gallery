import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
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
