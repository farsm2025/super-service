import type {MetadataRoute} from "next";
import {SITE_LAUNCHED, SITE_URL} from "../lib/site";

export default function robots():MetadataRoute.Robots {
  if (!SITE_LAUNCHED) {
    return {rules: {userAgent: "*", disallow: "/"}};
  }

  return {
    rules: {userAgent: "*", allow: "/", disallow: ["/studio", "/api/"]},
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
