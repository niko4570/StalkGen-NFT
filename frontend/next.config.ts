import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'],
  },
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
}

export default nextConfig
