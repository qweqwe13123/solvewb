import Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sendCancellationEmail,
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
  sendRenewalEmail,
  sendPurchaseThankYouEmail,
} from "@/lib/email.server";
import { PLANS, priceIdToPlanId, type BillingPeriod, type PlanId } from "@/lib/stripe-config";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe.server";

type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: PlanId;
  billing_period: BillingPeriod;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  stripe_customer_id: string | null;
};

function toIso(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

async function getProfileByCustomerId(customerId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}

async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}

async function getProfileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, stripe_customer_id")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}

async function upsertProfileCustomerId(userId: string, stripeCustomerId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

async function resolveUserContext(
  stripeCustomerId: string | null,
  userIdFromMeta: string | undefined,
) {
  if (userIdFromMeta) {
    const profile = await getProfileByUserId(userIdFromMeta);
    return { userId: userIdFromMeta, profile };
  }

  if (!stripeCustomerId) return { userId: null, profile: null };

  const profile = await getProfileByCustomerId(stripeCustomerId);
  if (profile) {
    return { userId: profile.id, profile };
  }

  const customer = await getStripe().customers.retrieve(stripeCustomerId);
  if (customer && !("deleted" in customer) && customer.email) {
    const createdProfile = await resolveOrCreateUserByEmail(customer.email, customer.name ?? null);
    return { userId: createdProfile.id, profile: createdProfile };
  }

  return { userId: null, profile: null };
}

async function resolveOrCreateUserByEmail(email: string, fullName: string | null) {
  const existingProfile = await getProfileByEmail(email);
  if (existingProfile) {
    return existingProfile;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Unable to create billing user.");
  }

  const createdProfile = await getProfileByUserId(data.user.id);
  if (createdProfile) return createdProfile;

  const { data: fallbackProfile, error: fallbackError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, stripe_customer_id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (fallbackError) throw new Error(fallbackError.message);
  if (!fallbackProfile) throw new Error("Created profile not found.");
  return fallbackProfile as ProfileRow;
}

async function upsertSubscriptionRow(subscription: Stripe.Subscription) {
  const customerId = getCustomerId(subscription.customer);
  const meta = subscription.metadata as Partial<{
    user_id: string;
    plan: PlanId;
    billing_period: BillingPeriod;
  }>;
  const priceId = subscription.items.data[0]?.price?.id;
  const mapped = priceId ? priceIdToPlanId(priceId) : null;
  const plan = meta.plan ?? mapped?.plan ?? "starter";
  const billingPeriod = meta.billing_period ?? mapped?.period ?? "monthly";
  const { userId, profile } = await resolveUserContext(customerId, meta.user_id);

  if (!userId || !customerId) {
    throw new Error("Unable to resolve subscription owner.");
  }

  await upsertProfileCustomerId(userId, customerId);

  const payload = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? subscription.items.data[0]?.price?.id ?? "",
    plan,
    billing_period: billingPeriod,
    status: subscription.status,
    current_period_start: toIso((subscription as any).current_period_start),
    current_period_end: toIso((subscription as any).current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: toIso(subscription.canceled_at ?? undefined),
    trial_end: toIso(subscription.trial_end ?? undefined),
  };

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(payload, { onConflict: "stripe_subscription_id" })
    .select(
      "id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan, billing_period, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_end",
    )
    .single();

  if (error) throw new Error(error.message);

  return {
    row: data as SubscriptionRow,
    profile: profile ?? (customerId ? await getProfileByCustomerId(customerId) : null),
    plan,
    billingPeriod,
    customerId,
    userId,
  };
}

async function upsertPaymentHistory(args: {
  invoice: Stripe.Invoice;
  subscriptionRowId: string | null;
  userId: string;
  status: "succeeded" | "failed";
}) {
  const { invoice, subscriptionRowId, userId, status } = args;
  const paymentIntentId =
    typeof (invoice as any).payment_intent === "string"
      ? (invoice as any).payment_intent
      : ((invoice as any).payment_intent?.id ?? null);
  const payload = {
    user_id: userId,
    subscription_id: subscriptionRowId,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: paymentIntentId,
    amount: invoice.amount_paid || invoice.amount_due || 0,
    currency: invoice.currency || "usd",
    status,
    description:
      invoice.lines.data[0]?.description ??
      invoice.description ??
      `Stripe invoice ${invoice.number ?? invoice.id}`,
    hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    invoice_pdf_url: invoice.invoice_pdf ?? null,
    receipt_url: null,
    paid_at: invoice.status_transitions.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
  };

  const { error } = await supabaseAdmin
    .from("payment_history")
    .upsert(payload, { onConflict: "stripe_invoice_id" });

  if (error) throw new Error(error.message);
}

async function getStripeCustomerEmail(customerId: string | null) {
  if (!customerId) return null;
  const profile = await getProfileByCustomerId(customerId);
  if (profile?.email) return profile.email;

  const customer = await getStripe().customers.retrieve(customerId);
  if (customer && !("deleted" in customer)) {
    return customer.email ?? null;
  }
  return null;
}

async function syncSubscriptionFromStripe(subscriptionId: string) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return upsertSubscriptionRow(subscription);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;
  if (!session.subscription) return;

  const stripe = getStripe();
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const checkoutEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const checkoutName = session.customer_details?.name ?? null;
  if (!checkoutEmail) {
    throw new Error("Checkout completed without customer email.");
  }

  const profile = await resolveOrCreateUserByEmail(checkoutEmail, checkoutName);
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      user_id: profile.id,
      plan: session.metadata?.plan ?? "",
      billing_period: session.metadata?.billing_period ?? "",
    },
  });
  const synced = await upsertSubscriptionRow(subscription);

  const email =
    profile.email ?? synced.profile?.email ?? (await getStripeCustomerEmail(synced.customerId));

  if (email) {
    await sendPurchaseThankYouEmail(email, PLANS[synced.plan].name);
  }
}

async function handleInvoiceSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;
  const stripe = getStripe();
  const subscriptionId =
    typeof (invoice as any).subscription === "string" ? (invoice as any).subscription : (invoice as any).subscription.id;
  const synced = await upsertSubscriptionRow(await stripe.subscriptions.retrieve(subscriptionId));
  await upsertPaymentHistory({
    invoice,
    subscriptionRowId: synced.row.id,
    userId: synced.userId,
    status: "succeeded",
  });

  const email = synced.profile?.email ?? (await getStripeCustomerEmail(synced.customerId));
  if (!email) return;

  const planName = PLANS[synced.plan].name;
  if (invoice.billing_reason === "subscription_cycle") {
    await sendRenewalEmail({
      to: email,
      planName,
      amount: invoice.amount_paid || invoice.amount_due || 0,
      currency: invoice.currency || "usd",
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
      nextRenewal: synced.row.current_period_end,
      receiptUrl: invoice.hosted_invoice_url ?? null,
    });
    return;
  }

  await sendPaymentConfirmationEmail({
    to: email,
    planName,
    amount: invoice.amount_paid || invoice.amount_due || 0,
    currency: invoice.currency || "usd",
    paidAt: invoice.status_transitions.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date(),
    invoiceUrl: invoice.hosted_invoice_url ?? null,
    receiptUrl: invoice.hosted_invoice_url ?? null,
  });
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;
  const stripe = getStripe();
  const subscriptionId =
    typeof (invoice as any).subscription === "string" ? (invoice as any).subscription : (invoice as any).subscription.id;
  const synced = await upsertSubscriptionRow(await stripe.subscriptions.retrieve(subscriptionId));
  await upsertPaymentHistory({
    invoice,
    subscriptionRowId: synced.row.id,
    userId: synced.userId,
    status: "failed",
  });

  const email = synced.profile?.email ?? (await getStripeCustomerEmail(synced.customerId));
  if (!email) return;

  await sendPaymentFailedEmail({
    to: email,
    planName: PLANS[synced.plan].name,
    amount: invoice.amount_due || invoice.amount_paid || 0,
    currency: invoice.currency || "usd",
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const synced = await upsertSubscriptionRow(subscription);
  const email = synced.profile?.email ?? (await getStripeCustomerEmail(synced.customerId));
  if (!email) return;

  await sendCancellationEmail({
    to: email,
    planName: PLANS[synced.plan].name,
    accessUntil: synced.row.current_period_end,
  });
}

export async function processStripeWebhook(rawBody: string, signature: string | null) {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();

  if (!signature) {
    throw new Error("Missing Stripe signature header.");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook payload.";
    throw new Error(message);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await syncSubscriptionFromStripe((event.data.object as Stripe.Subscription).id);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await handleInvoiceSucceeded(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoiceFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}


export async function syncCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
  if (session.mode === "subscription" && session.subscription) {
    await handleCheckoutCompleted(session);
    return { ok: true };
  }
  return { ok: false };
}

export async function checkCustomerActiveSubscription(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    const stripe = getStripe();
    const cleanEmail = email.toLowerCase().trim();
    const customers = await stripe.customers.list({ email: cleanEmail, limit: 10 });
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 10 });
      for (const sub of subs.data) {
        if (["active", "trialing", "past_due"].includes(sub.status)) {
          try {
            await upsertSubscriptionRow(sub);
          } catch (e) {
            console.warn("Could not upsert live stripe subscription row:", e);
          }
          return true;
        }
      }
    }

    // Also check recent completed checkout sessions for instant access without indexing delay
    const recentSessions = await stripe.checkout.sessions.list({ limit: 10 });
    for (const session of recentSessions.data) {
      const sessionEmail = (
        session.customer_details?.email ||
        session.customer_email ||
        session.metadata?.email ||
        ""
      ).toLowerCase().trim();
      if (sessionEmail === cleanEmail && session.mode === "subscription" && session.subscription) {
        try {
          await handleCheckoutCompleted(session);
          return true;
        } catch (e) {
          console.warn("Error handling recent session sync in checkCustomerActiveSubscription:", e);
        }
      }
    }
  } catch (err) {
    console.warn("Stripe live customer subscription check error:", err);
  }
  return false;
}
