/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'api.nc.groupe-nissi.com', 'nc.groupe-nissi.com'],
  },
}

module.exports = nextConfig
