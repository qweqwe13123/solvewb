import { getSiteEnv } from "@/lib/env.server";
import { getStripe } from "@/lib/stripe.server";
import { PLANS, type BillingPeriod, type PlanId } from "@/lib/stripe-config";

export async function createHostedCheckoutUrl(input: {
  plan: PlanId;
  period: BillingPeriod;
  userId?: string;
  email?: string;
}) {
  const stripe = getStripe();
  const origin = getSiteEnv().SITE_URL || "https://www.solverwebsite.com";
  const planConfig = PLANS[input.plan] ?? PLANS.starter;
  const priceId = planConfig.prices[input.period];

  if (!priceId) {
    throw new Error(`Stripe price is not configured for ${input.plan}/${input.period}.`);
  }

  const normalizedEmail = input.email?.trim().toLowerCase() || undefined;
  const metadata = {
    plan: planConfig.id,
    billing_period: input.period,
    user_id: input.userId || "",
    email: normalizedEmail || "",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscriptions?checkout=canceled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: input.userId || undefined,
    customer_email: normalizedEmail,
    metadata,
    subscription_data: { metadata },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session URL was not created.");
  }

  return session.url;
}
