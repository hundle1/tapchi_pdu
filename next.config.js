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

  // ✅ CRITICAL: Webpack config để fix pdfjs-dist
  webpack: (config, { isServer }) => {
    // ✅ Externalize canvas và encoding
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
      encoding: 'encoding',
    });

    // ✅ QUAN TRỌNG: Ignore pdfjs-dist trên client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };

      // ✅ Fix cho pdfjs-dist
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        encoding: false,
      };
    }

    // ✅ Ignore node modules
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

// ✅ Clean pdf-parse test folder
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