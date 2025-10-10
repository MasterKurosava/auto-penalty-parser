const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2', 'pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@node-rs/argon2': false,
        'libsodium-wrappers': false,
        'pdf-parse': false,
      }
    }
    return config
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
}

module.exports = nextConfig
