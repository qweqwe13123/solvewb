import { PLANS, type BillingPeriod, type PlanId } from "@/lib/stripe-config";
import { getSiteEnv } from "@/lib/env.server";
import { getStripe } from "@/lib/stripe.server";

export async function createHostedCheckoutUrl(input: { plan: PlanId; period: BillingPeriod }) {
  const stripe = getStripe();
  const origin = getSiteEnv().SITE_URL || "https://www.solverwebsite.com";
  const planConfig = PLANS[input.plan] || PLANS.starter;
  const amount = input.period === "annually" ? Math.round(planConfig.monthlyPrice * 0.8 * 12 * 100) : planConfig.monthlyPrice * 100;
  const interval = input.period === "annually" ? "year" : "month";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `AI Video Bootcamp (${planConfig.name})`,
            description: `Full access to AI Video Bootcamp courses and community (${planConfig.name} plan)`,
          },
          unit_amount: amount,
          recurring: {
            interval: interval,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/courses`,
    allow_promotion_codes: true,
    metadata: { plan: input.plan, billing_period: input.period },
    subscription_data: {
      metadata: { plan: input.plan, billing_period: input.period },
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session URL was not created.");
  }

  return session.url;
}
