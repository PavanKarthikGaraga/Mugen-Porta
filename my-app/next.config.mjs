/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Applies to both Server Actions AND route handlers in Next.js 15+
  serverActions: {
    bodySizeLimit: '10mb',
  },
  // Keep heavy Node.js-native packages out of the webpack bundle so they
  // resolve correctly from node_modules at runtime in production.
  serverExternalPackages: ['@aws-sdk/client-s3'],
};

export default nextConfig;
