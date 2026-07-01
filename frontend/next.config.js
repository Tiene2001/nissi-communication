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
  },
}

module.exports = nextConfig
