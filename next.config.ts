import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {remotePatterns: [{protocol: "https", hostname: "cdn.sanity.io"}]},
  async headers() {
    if (process.env.SITE_LAUNCHED === "true") return [];

    return [
      {
        source: "/:path*",
        headers: [
          {key: "X-Robots-Tag", value: "noindex, nofollow, noarchive"},
        ],
      },
    ];
  },
};

export default nextConfig;
