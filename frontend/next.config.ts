import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'],
  },
}

export default nextConfig
