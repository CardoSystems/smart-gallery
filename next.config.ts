import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.xperia.pt',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.netlify.app',
        pathname: '/**',
      },
    ],
  },
  // Optimize for static site generation
  staticPageGenerationTimeout: 60,
  // Skip specific pages from static generation if needed
  basePath: '',
  trailingSlash: false,
};

export default nextConfig;
