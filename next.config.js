/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    //ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Handle custom domain requests
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?!tiny\\.pm|localhost).*',  // Match any non-primary domain
            },
          ],
          destination: '/api/proxy/:path*',  // Route through our proxy handler
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // Required for Cloudflare SSL/TLS
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
