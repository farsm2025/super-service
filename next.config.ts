import type { NextConfig } from "next";

const legacyHosts = [
  "kings-and-queens-transport.ch",
  "www.kings-and-queens-transport.ch",
];

const legacyRoutes = [
  {source: "/", destination: "https://super-service.ch/"},
  {source: "/services", destination: "https://super-service.ch/services"},
  {
    source: "/services-de-demenagement",
    destination: "https://super-service.ch/services/demenagement",
  },
  {source: "/contact", destination: "https://super-service.ch/devis"},
  {source: "/353-2", destination: "https://super-service.ch/"},
  {source: "/:path*", destination: "https://super-service.ch/"},
];

const nextConfig: NextConfig = {
  images: {remotePatterns: [{protocol: "https", hostname: "cdn.sanity.io"}]},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {key:"X-Content-Type-Options",value:"nosniff"},
          {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
          {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
          ...(process.env.SITE_LAUNCHED === "true"?[]:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]),
        ],
      },
    ];
  },
  async redirects() {
    if (process.env.ENABLE_LEGACY_REDIRECTS !== "true") return [];

    return legacyHosts.flatMap((host) =>
      legacyRoutes.map((route) => ({
        ...route,
        has: [{type: "host" as const, value: host}],
        statusCode: 301 as const,
      })),
    );
  },
};

export default nextConfig;
