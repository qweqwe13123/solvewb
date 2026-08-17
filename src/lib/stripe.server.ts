import Stripe from "stripe";

let _stripe: Stripe | null = null;

function requireStripeKey(name: "STRIPE_SECRET_KEY" | "STRIPE_PUBLISHABLE_KEY") {
  const key = process.env[name]?.trim();
  if (!key) {
    throw new Error(`${name} is not configured`);
  }

  if (
    process.env.NODE_ENV === "production" &&
    ((name === "STRIPE_SECRET_KEY" && !key.startsWith("sk_live_")) ||
      (name === "STRIPE_PUBLISHABLE_KEY" && !key.startsWith("pk_live_")))
  ) {
    throw new Error(`${name} must use a Stripe Live Mode key in production`);
  }

  return key;
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = requireStripeKey("STRIPE_SECRET_KEY");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  return _stripe;
}

export function getStripePublishableKey(): string {
  return requireStripeKey("STRIPE_PUBLISHABLE_KEY");
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return secret;
}
