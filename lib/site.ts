export const SITE_URL = "https://super-service.ch";

export const SITE_LAUNCHED = process.env.SITE_LAUNCHED === "true";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
