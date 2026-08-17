import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const DESIGNATED_ADMIN_EMAIL = "turanoglumehmet1@gmail.com";

export type AdminMember = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userEmail = (context.claims?.email || context.user?.email || "").toLowerCase().trim();
    if (userEmail !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      return { isAdmin: false };
    }

    try {
      await context.supabase.rpc("claim_admin_role");
    } catch {}

    return { isAdmin: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ members: AdminMember[]; total: number }> => {
    const userEmail = (context.claims?.email || context.user?.email || "").toLowerCase().trim();
    if (userEmail !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) throw new Error("Forbidden");

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (error || !data?.users) {
        return {
          members: [
            {
              id: context.userId,
              email: context.claims?.email || DESIGNATED_ADMIN_EMAIL,
              name: "Admin Owner",
              avatarUrl: null,
              createdAt: new Date().toISOString(),
              lastSignInAt: new Date().toISOString(),
            },
          ],
          total: 1,
        };
      }

      const members: AdminMember[] = data.users.map((u) => ({
        id: u.id,
        email: u.email ?? "—",
        name:
          ((u.user_metadata?.["full_name"] as string | undefined) ??
            (u.user_metadata?.["name"] as string | undefined)) ||
          (u.email ?? "—"),
        avatarUrl: (u.user_metadata?.["avatar_url"] as string | undefined) ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
      }));

      return { members, total: members.length };
    } catch {
      return {
        members: [
          {
            id: context.userId,
            email: context.claims?.email || DESIGNATED_ADMIN_EMAIL,
            name: "Admin Owner",
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            lastSignInAt: new Date().toISOString(),
          },
        ],
        total: 1,
      };
    }
  });

export type AdminProUser = {
  subscriptionId: string;
  userId: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  createdAt: string;
};

type AdminContext = { claims?: Record<string, unknown>; user?: { email?: string | null } };

async function assertDesignatedAdmin(context: AdminContext) {
  const userEmail = (context.claims?.email || context.user?.email || "").toString().toLowerCase().trim();
  if (userEmail !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) throw new Error("Forbidden");
}

function stripeCustomerDetails(customer: unknown) {
  if (!customer || typeof customer === "string") return { id: String(customer || ""), email: null, name: null };
  const record = customer as { id?: string; email?: string | null; name?: string | null };
  return { id: record.id || "", email: record.email ?? null, name: record.name ?? null };
}

export const listProUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ users: AdminProUser[]; total: number }> => {
    await assertDesignatedAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getStripe } = await import("@/lib/stripe.server");
    const usersBySubscription = new Map<string, AdminProUser>();

    // Stripe is the source of truth here. This includes Test Mode customers even
    // when a webhook was not configured and no Supabase subscription row exists yet.
    const stripeSubscriptions = await getStripe().subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer"],
    });
    for (const subscription of stripeSubscriptions.data) {
      if (!["active", "trialing", "past_due"].includes(subscription.status)) continue;
      const customer = stripeCustomerDetails(subscription.customer);
      const metadata = subscription.metadata || {};
      const itemPriceId = subscription.items.data[0]?.price?.id || "";
      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
      const userId = metadata.user_id || `stripe:${customer.id}`;
      usersBySubscription.set(subscription.id, {
        subscriptionId: subscription.id,
        userId,
        email: customer.email || metadata.email || "—",
        name: customer.name || customer.email || "Stripe customer",
        plan: metadata.plan || "paid",
        status: subscription.status,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        createdAt: new Date(subscription.created * 1000).toISOString(),
      });
      void itemPriceId;
    }

    // Enrich the Stripe list with app profile names and keep any synced rows that
    // are not returned by the current Stripe pagination.
    try {
      const { data: subscriptions, error } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, stripe_subscription_id, plan, status, cancel_at_period_end, current_period_end, created_at")
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false });
      if (!error) {
        for (const subscription of subscriptions ?? []) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("email, full_name")
            .eq("id", subscription.user_id)
            .maybeSingle();
          const existing = usersBySubscription.get(subscription.stripe_subscription_id);
          usersBySubscription.set(subscription.stripe_subscription_id, {
            subscriptionId: subscription.stripe_subscription_id,
            userId: subscription.user_id,
            email: profile?.email ?? existing?.email ?? "—",
            name: profile?.full_name ?? profile?.email ?? existing?.name ?? "Unnamed user",
            plan: subscription.plan || existing?.plan || "paid",
            status: subscription.status,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            currentPeriodEnd: subscription.current_period_end ?? existing?.currentPeriodEnd ?? null,
            createdAt: subscription.created_at ?? existing?.createdAt ?? new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.warn("Could not enrich Pro users from Supabase:", error);
    }

    const users = [...usersBySubscription.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return { users, total: users.length };
  });

export const cancelProUserSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ subscriptionId: z.string().min(1) }).parse(data || {}))
  .handler(async ({ context, data }) => {
    await assertDesignatedAdmin(context);
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = getStripe();
    const current = await stripe.subscriptions.retrieve(data.subscriptionId);
    if (["canceled", "incomplete_expired", "unpaid"].includes(current.status)) {
      throw new Error("Subscription is no longer active");
    }

    const updated = await stripe.subscriptions.cancel(data.subscriptionId);
    const canceledAt = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled", cancel_at_period_end: false, canceled_at: canceledAt })
      .eq("stripe_subscription_id", data.subscriptionId);
    if (updateError) console.warn("Could not update mirrored subscription row:", updateError.message);

    return { ok: true, status: updated.status, canceledAt };
  });


export const cancelProUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ subscriptionIds: z.array(z.string().min(1)).min(1).max(100) }).parse(data || {}),
  )
  .handler(async ({ context, data }) => {
    await assertDesignatedAdmin(context);
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = getStripe();
    const results = await Promise.allSettled(
      data.subscriptionIds.map(async (subscriptionId) => {
        const updated = await stripe.subscriptions.cancel(subscriptionId);
        const canceledAt = new Date().toISOString();
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled", cancel_at_period_end: false, canceled_at: canceledAt })
          .eq("stripe_subscription_id", subscriptionId);
        if (error) console.warn("Could not update mirrored subscription row:", error.message);
        return { subscriptionId, status: updated.status };
      }),
    );
    const canceledIds: string[] = [];
    const failed: Array<{ subscriptionId: string; error: string }> = [];
    results.forEach((result, index) => {
      const subscriptionId = data.subscriptionIds[index];
      if (result.status === "fulfilled") canceledIds.push(subscriptionId);
      else {
        failed.push({
          subscriptionId,
          error: result.reason instanceof Error ? result.reason.message : "Cancellation failed",
        });
      }
    });
    return { ok: failed.length === 0, canceledIds, failed };
  });
