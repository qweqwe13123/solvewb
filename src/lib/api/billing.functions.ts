import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the Stripe publishable key (client-safe, but kept on server to avoid build-time inlining).
 */
export const getStripePublishableKeyFn = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("STRIPE_PUBLISHABLE_KEY is not configured");
  return { publishableKey: key };
});

/**
 * Get current user's subscription + recent payments for the account page.
 */
export const getMyBillingInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const [subRes, payRes, profileRes] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("payment_history")
        .select("*")
        .eq("user_id", userId)
        .order("paid_at", { ascending: false, nullsFirst: false })
        .limit(20),
      supabaseAdmin.from("profiles").select("email, full_name").eq("id", userId).maybeSingle(),
    ]);

    return {
      subscription: subRes.data,
      payments: payRes.data ?? [],
      profile: profileRes.data,
    };
  });

/**
 * Cancel the current subscription at the end of the billing period.
 */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = getStripe();
    const userId = context.userId;

    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!sub) throw new Error("No active subscription found");

    const updated = (await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })) as unknown as { cancel_at_period_end: boolean; current_period_end: number };

    return {
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
    };
  });

/**
 * Re-activate a subscription that's set to cancel at period end.
 */
export const resumeMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = getStripe();
    const userId = context.userId;

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .eq("cancel_at_period_end", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub) throw new Error("No subscription scheduled to cancel");

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    return { cancelAtPeriodEnd: updated.cancel_at_period_end };
  });

/**
 * Create a Stripe Billing Portal session so the user can update card/invoices.
 */
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = getStripe();
    const userId = context.userId;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.stripe_customer_id) throw new Error("No Stripe customer found");

    const origin = process.env.SITE_URL || "https://www.solverwebsite.com";
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/account/billing`,
    });
    return { url: portal.url };
  });
