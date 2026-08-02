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
};

export default nextConfig;
