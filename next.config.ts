import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'pdf-parse', 'mammoth'],
};

export default nextConfig;
