/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
  async rewrites() {
    return [
      // Rewrite /uploads/* to the API file-server so every Nginx proxy config
      // routes the request through Node.js rather than trying to serve a static
      // file from disk (which doesn't exist in production deployments).
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
