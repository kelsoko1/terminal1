/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to enable server-side rendering and API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { domains: ['localhost', 'kelsoko.org'] },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  // Handle Node.js modules for PostgreSQL
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'cloudflare:sockets': false,
      };
      
      // Disable critical context warnings
      config.module.exprContextCritical = false;
      config.module.unknownContextCritical = false;
    }
    return config;
  },
};

module.exports = nextConfig;
