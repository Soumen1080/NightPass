/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.experiments = { 
      ...config.experiments, 
      asyncWebAssembly: true, 
      topLevelAwait: true,
      layers: true 
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      stream: 'stream-browserify',
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': join(process.cwd(), 'lib/isomorphic-ws-fix.mjs'),
    };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      (warning) => warning.message && warning.message.includes('async/await') && warning.message.includes('asyncWebAssembly'),
    ];
    return config;
  },
  // Static generation tries to resolve the SDK's Node deps and can hang the build.
  images: { unoptimized: true },
};

import { join } from 'node:path';
export default nextConfig;
