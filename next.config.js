/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ✅ Webpack config để fix lỗi canvas
  webpack: (config, { isServer }) => {
    // Thêm externals cho canvas
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
      encoding: 'encoding',
    });

    // Disable node modules cho client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Ignore canvas module
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },

  // ✅ Headers cho PDF serving
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/pdf',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const path = require('path');
const fs = require('fs');

try {
  const pdfTestPath = path.join(__dirname, 'node_modules/pdf-parse/test');
  if (fs.existsSync(pdfTestPath)) {
    fs.rmSync(pdfTestPath, { recursive: true, force: true });
  }
} catch (error) {
  console.log('Clean pdf-parse test folder:', error.message);
}

module.exports = nextConfig;