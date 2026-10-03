import Stripe from "stripe";
import {neon} from "@neondatabase/serverless";

// This first integration deliberately cannot charge a live card.
export function stripeTestEnabled() {
  return process.env.STRIPE_PAYMENTS_ENABLED === "true" && process.env.VERCEL_ENV !== "production";
}
export function stripeClient() {
  if (!stripeTestEnabled()) throw new Error("Stripe test payments disabled");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_test_")) throw new Error("A Stripe test secret key is required");
  return new Stripe(key);
}
export function paymentDatabase() {
  stripeClient();
  // No fallback to the existing calendar database: test writes must be isolated.
  const url = process.env.STRIPE_DATABASE_URL;
  if (!url) throw new Error("STRIPE_DATABASE_URL is required (isolated Neon branch)");
  return neon(url);
}
export function paymentOrigin() {
  const value = process.env.STRIPE_APP_URL;
  if (!value) throw new Error("STRIPE_APP_URL is required");
  const url = new URL(value);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) throw new Error("Invalid payment origin");
  return url.origin;
}
