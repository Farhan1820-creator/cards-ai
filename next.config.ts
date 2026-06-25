import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
           {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
        {
        protocol: 'https',
        hostname: 'img.magnific.com',
      },
        {
      protocol: "https",
      hostname: "lh3.googleusercontent.com",
    },
        {
      protocol: "https",
      hostname: "encrypted-tbn0.gstatic.com",
    },
    ],
  },
  allowedDevOrigins:[
    "192.168.0.121"
  ]
};

export default nextConfig;
