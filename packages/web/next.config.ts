import type { NextConfig } from 'next';
import path from 'path';
import { config as loadDotenv } from 'dotenv';
import createNextIntlPlugin from 'next-intl/plugin';

// Baca .env dari root monorepo (2 level ke atas dari packages/web)
loadDotenv({ path: path.resolve(__dirname, '../../.env'), override: false });

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/7.x/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/docs/:path*',
        destination: '/bantuan/:path*',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );

    // Fix TypeScript extension resolution for @abelionorg/core
    // Remove .js from extensions and prioritize .ts/.tsx
    config.resolve.extensions = ['.ts', '.tsx', '.mjs', '.cjs', '.js', '.jsx', '.json'];

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
