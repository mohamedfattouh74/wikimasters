import type { NextConfig } from "next";
import { dirname } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname(__filename),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "feb4gbrezlm49wjx.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
