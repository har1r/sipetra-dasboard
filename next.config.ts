import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "f998hms6-3000.asse.devtunnels.ms", // Domain tunnel Anda
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
