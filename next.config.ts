import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ws')
    }
    return config
  },
}

export default nextConfig