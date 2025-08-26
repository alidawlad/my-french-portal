import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Adding a comment to force a restart and load environment variables.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This rewrites rule is a workaround to map dynamic routes to a single page component
  // It allows for flexible module structures like /week-1/class-1 or /part-1/unit-2/lesson-drill
  // without needing separate page files for each structure.
  async rewrites() {
    return [
      {
        source: '/modules/week-:week/class-:class',
        destination: '/modules/[...path]',
      },
      {
        source: '/modules/part-:part/unit-:unit/lesson-:lesson',
        destination: '/modules/[...path]',
      },
    ]
  },
};

export default nextConfig;
