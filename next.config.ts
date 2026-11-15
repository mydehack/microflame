import type { NextConfig } from "next";

const backendUrl = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(isGithubPages ? {
    output: 'export',
    basePath: '/microflame',
    images: { unoptimized: true },
  } : {}),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async rewrites() {
    if (isGithubPages) return [];
    return [
      {
        source: '/api/research-bot/:path*',
        destination: `${backendUrl}/api/research-bot/:path*`,
      },
      {
        source: '/api/cea/:path*',
        destination: `${backendUrl}/api/cea/:path*`,
      },
      {
        source: '/api/engines/:path*',
        destination: `${backendUrl}/api/engines/:path*`,
      },
      {
        source: '/api/ntrs/:path*',
        destination: `${backendUrl}/api/ntrs/:path*`,
      },
      {
        source: '/api/nasa/:path*',
        destination: `${backendUrl}/api/nasa/:path*`,
      },
    ];
  },
};

export default nextConfig;
