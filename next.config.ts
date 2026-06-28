import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qiqzydlgwddiagetthgk.storage.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/nuss/**',
      },
    ],
  },
};

export default withPayload(nextConfig);
