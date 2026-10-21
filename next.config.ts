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
  images: {
    remotePatterns: [{protocol: "https", hostname: "cdn.sanity.io"}],
    // Deliver modern responsive formats and keep optimized variants cached for a day.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      // Static public photos and logos only. Never cache personalized pages or APIs.
      ...["/images/:path*", "/logo-super-service.jpg", "/logo-header.jpg"].map(
        (source) => ({
          source,
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600, s-maxage=86400",
            },
          ],
        }),
      ),
      {
        source: "/:path*",
        headers: [
          {key:"X-Content-Type-Options",value:"nosniff"},
          {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
          {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
          ...(process.env.SITE_LAUNCHED === "true"?[]:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]),
        ],
      },
      {source:"/commande/:path*",headers:[{key:"Referrer-Policy",value:"no-referrer"},{key:"Cache-Control",value:"no-store"}]},
      {source:"/paiement/:path*",headers:[{key:"Referrer-Policy",value:"no-referrer"},{key:"Cache-Control",value:"no-store"}]},
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
