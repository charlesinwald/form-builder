import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure AI dependencies work in production
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  
  images: {
    remotePatterns: [
      // IPv4 localhost (127.0.0.1) - preferred for new URLs
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/api/v1/public/files/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/api/v1/public/files/**",
      },
      // Standard localhost - for existing URLs in database
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/public/files/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/v1/public/files/**",
      },
      // Production domains
      {
        protocol: "https",
        hostname: "**",
        pathname: "/api/v1/public/files/**",
      },
      {
        protocol: "https",
        hostname: "formcraft.digital",
        pathname: "/api/v1/files/**",
      },
      {
        protocol: "https",
        hostname: "formcraft.digital",
        pathname: "/api/v1/public/files/**",
      },
    ],
  },
};

export default nextConfig;
