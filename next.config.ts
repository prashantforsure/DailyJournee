import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  transpilePackages: ['novel'],
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
   
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;