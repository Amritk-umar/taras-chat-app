/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // You can also ignore TypeScript errors if they pop up
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
