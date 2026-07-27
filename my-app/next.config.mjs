/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Applies to both Server Actions AND route handlers in Next.js 15+
  serverActions: {
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
