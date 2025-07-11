import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // The protocol (http or https)
        hostname: 'images.unsplash.com', // The domain of your image
        port: '', // Leave empty if no specific port is used
        pathname: '/**', // Allow any path under this hostname
      },
    ],
  },
};

export default nextConfig;
