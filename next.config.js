/** @type {import('next').NextConfig} */
const path = require('path');

// Define project paths explicitly to avoid path resolution issues
const projectDir = process.cwd();
const appDir = path.join(projectDir, 'app');
const pagesDir = path.join(projectDir, 'pages');

const nextConfig = {
  // Basic configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { domains: ['localhost', 'kelsoko.org'] },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  // Explicitly define directory structure
  distDir: '.next',
  // Help Next.js correctly identify page files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Explicitly set directories to help with path resolution
  useFileSystemPublicRoutes: true,
  // Handle Node.js modules for PostgreSQL
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Simplified fallback configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'cloudflare:sockets': false,
      };
    }
    
    // Disable critical context warnings
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;
    
    return config;
  },
};

module.exports = nextConfig;
