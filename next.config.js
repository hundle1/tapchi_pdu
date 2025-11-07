/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ✅ Config cho API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },

  // ✅ Cho phép ảnh từ các domain bên ngoài (nếu dùng Next/Image)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
const path = require('path');
const fs = require('fs');

try {
  const pdfTestPath = path.join(__dirname, 'node_modules/pdf-parse/test');
  if (fs.existsSync(pdfTestPath)) fs.rmSync(pdfTestPath, { recursive: true, force: true });
} catch { }

module.exports = nextConfig;
