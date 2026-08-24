import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {remotePatterns: [{protocol: "https", hostname: "cdn.sanity.io"}]},
  async redirects() {
    return [
      {
        source: "/services/transport-debarras",
        destination: "/services/transport-et-livraison",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
