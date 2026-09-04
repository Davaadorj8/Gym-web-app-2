import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'ais-dev-yksuropc4ty6er5bdq3y77-378144986638.asia-northeast1.run.app',
    'ais-pre-yksuropc4ty6er5bdq3y77-378144986638.asia-northeast1.run.app',
    '*.run.app',
  ],
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  transpilePackages: ['motion'],
  turbopack: {},
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
