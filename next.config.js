/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // <-- REMOVE or comment this line
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
