import type { NextConfig } from 'next';
import path from 'node:path';
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
};

export default withNextIntl(nextConfig);
