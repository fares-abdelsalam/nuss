import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qiqzydlgwddiagetthgk.storage.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/nuss/**",
      },
      {
        protocol: "https",
        hostname: "nuss.sa",
      },
    ],
  },
};

export default withPayload(nextConfig);
