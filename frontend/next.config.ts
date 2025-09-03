/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      // This rule proxies API calls
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      // ✅ ADD THIS RULE to proxy image requests
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8000/uploads/:path*',
      },
    ]
  },
};

module.exports = nextConfig;