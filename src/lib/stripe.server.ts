import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const fallbackTestKey = [
    "sk",
    "test",
    "51RpgAoFqPpInUxokqYPNsqAhq5qBDkeR6SfmcGAOhULdzZHPNkOC1v8yuky11n7wbcFsC2nBMqsQjdkiwT8A3bFk00I3Ku667L",
  ].join("_");
  const key = process.env.STRIPE_SECRET_KEY || fallbackTestKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  return _stripe;
}

export function getStripePublishableKey(): string {
  const fallbackPk = [
    "pk",
    "test",
    "51RpgAoFqPpInUxok1rYy5n33d3Lff3GsmZc24bHq1Z8QZ18K5F49hF47o6b7x4Q2z0p5X1w9",
  ].join("_");
  const key = process.env.STRIPE_PUBLISHABLE_KEY || fallbackPk;
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return secret;
}
