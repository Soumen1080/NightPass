/** @type {import('next').NextConfig} */
import { join } from 'node:path';

const nextConfig = {
  output: 'standalone',

  // ─── Performance: Compiler options ──────────────────────────────────────
  compiler: {
    // Remove console.log in production (keeps console.error and console.warn)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    config.experiments = { 
      ...config.experiments, 
      asyncWebAssembly: true, 
      topLevelAwait: true,
      layers: true 
    };

    // These fallbacks only apply on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        stream: 'stream-browserify',
      };
    }

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

export default nextConfig;
