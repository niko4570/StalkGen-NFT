import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'],
  },
  // Fix Next.js warning about multiple lockfiles by specifying correct workspace root
  outputFileTracingRoot: '/home/niko/code/StalkGen-NFT/frontend',
}

export default nextConfig
