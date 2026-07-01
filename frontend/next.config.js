/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'api.nc.groupe-nissi.com', 'nc.groupe-nissi.com'],
  },
  experimental: {
    staleTimes: { dynamic: 0 },
    serverExternalPackages: ['@imgly/background-removal'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Empêche webpack de bundler cette lib browser-only côté serveur
      config.externals = [...(config.externals || []), '@imgly/background-removal']
    }
    return config
  },
}

module.exports = nextConfig
