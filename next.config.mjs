/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      'localhost:3000',
      '192.168.0.147:3000',
      '127.0.0.1:3000'
    ],
  },
  // Handle network access for development
  assetPrefix: process.env.NODE_ENV === 'development' ? undefined : undefined,
  // Ensure proper chunk loading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure chunks are properly loaded in development
      config.output.publicPath = '/_next/';
      // Add chunk loading timeout (using correct property name)
      config.output.chunkLoadTimeout = 120000; // 2 minutes
      // Ensure proper chunk naming
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Create a common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
}

export default nextConfig
