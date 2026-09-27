import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore', 'pdf-parse', 'mammoth', '@napi-rs/canvas'],
};

export default nextConfig;
