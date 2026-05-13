import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // basePath: '/devdocs' — legges til ved monorepo-integrasjon (se ARCHITECTURE.md)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
