import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing from environment variables. Stripe features will fail at runtime.");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia" as any, // Use latest stable
  typescript: true,
});
