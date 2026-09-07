import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Standalone output needs to trace files across the pnpm workspace (../../packages/ui);
  // matches turbopack.root below so dev and the production build agree on the monorepo root.
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  transpilePackages: ['@shaddai/ui'],
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  // Starlink/CCTV and Website/Software Development were merged into one page each
  // (2026-09-05) — these old slugs may still be indexed/bookmarked.
  async redirects() {
    return [
      { source: '/services/starlink', destination: '/services/networking', permanent: true },
      { source: '/services/cctv', destination: '/services/networking', permanent: true },
      { source: '/services/website-development', destination: '/services/software-development', permanent: true },
    ];
  },
};

export default nextConfig;
