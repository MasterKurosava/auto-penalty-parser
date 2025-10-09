/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2', 'pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on client side
      config.resolve.alias = {
        ...config.resolve.alias,
        '@node-rs/argon2': false,
        'libsodium-wrappers': false,
        'pdf-parse': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
