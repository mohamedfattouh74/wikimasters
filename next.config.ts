import type { NextConfig } from "next";
import { dirname } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: dirname(__filename),
  },
  images: {
    remotePatterns: [
      new URL(`${process.env.BLOB_BASE_URL}/**`)
    ]
  }
};

export default nextConfig;
