export const SITE_URL = "https://super-service.ch";

export const SITE_LAUNCHED = process.env.SITE_LAUNCHED === "true";

export function absoluteUrl(path = "/", origin = SITE_URL) {
  return new URL(path, origin).toString();
}

export function safeSiteOrigin(requestUrl: string) {
  const url = new URL(requestUrl);
  const hostname = url.hostname.toLowerCase();

  if (hostname === "super-service.ch" || hostname.endsWith(".vercel.app")) {
    return url.origin;
  }

  return SITE_URL;
}
