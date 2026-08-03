import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://node2.gervhosting.my.id:5056/api/:path*",
      },
    ];
  },
};

export default nextConfig;
