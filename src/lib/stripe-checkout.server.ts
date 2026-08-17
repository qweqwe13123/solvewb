import { getSiteEnv } from "@/lib/env.server";
import { getStripe } from "@/lib/stripe.server";
import { BRAND, PLANS, type BillingPeriod, type PlanId } from "@/lib/stripe-config";

export async function createHostedCheckoutUrl(input: {
  plan: PlanId;
  period: BillingPeriod;
  userId?: string;
  email?: string;
  checkoutAttemptId?: string;
  priceId?: string;
}) {
  const stripe = getStripe();
  const origin = getSiteEnv().SITE_URL || "https://www.solverwebsite.com";
  const planConfig = PLANS[input.plan] ?? PLANS.starter;
  const priceId = input.priceId || planConfig.prices[input.period];

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

  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/courses?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/courses?checkout=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "auto",
      branding_settings: {
        display_name: BRAND.name,
        font_family: "inter",
        border_style: "rounded",
        background_color: "#f7f5f2",
        button_color: BRAND.color,
        logo: {
          type: "url",
          url: `${BRAND.websiteUrl}/favicon.png`,
        },
        icon: {
          type: "url",
          url: `${BRAND.websiteUrl}/favicon.png`,
        },
      },
      custom_text: {
        submit: {
          message: "Secure checkout. Your Solver access starts after payment confirmation.",
        },
      },
      client_reference_id: input.userId || undefined,
      customer_email: normalizedEmail,
      metadata,
      subscription_data: { metadata },
    },
    // Per-session branding requires Stripe API version 2025-09-30.clover;
    // the account-level Branding Settings remain unchanged.
    {
      apiVersion: "2025-09-30.clover" as any,
      idempotencyKey: input.checkoutAttemptId ? `checkout_${input.checkoutAttemptId}` : undefined,
    },
  );

  if (!session.url) {
    throw new Error("Stripe Checkout session URL was not created.");
  }

  return session.url;
}
