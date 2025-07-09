
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.oftern.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bartanow.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.eu-north-1.amazonaws.com', // Example, may need adjustment based on your bucket region
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com', // Generic pattern for virtual-hosted-style S3 buckets
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
