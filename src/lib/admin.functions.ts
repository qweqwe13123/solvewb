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

async function assertDesignatedAdmin(context: { claims?: Record<string, unknown>; user?: { email?: string | null } }) {
  const userEmail = (context.claims?.email || context.user?.email || "").toString().toLowerCase().trim();
  if (userEmail !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) throw new Error("Forbidden");
}

export const listProUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ users: AdminProUser[]; total: number }> => {
    await assertDesignatedAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subscriptions, error } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, stripe_subscription_id, plan, status, cancel_at_period_end, current_period_end, created_at")
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const users = await Promise.all(
      (subscriptions ?? []).map(async (subscription) => {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", subscription.user_id)
          .maybeSingle();
        return {
          subscriptionId: subscription.stripe_subscription_id,
          userId: subscription.user_id,
          email: profile?.email ?? "—",
          name: profile?.full_name ?? profile?.email ?? "Unnamed user",
          plan: subscription.plan,
          status: subscription.status,
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          currentPeriodEnd: subscription.current_period_end,
          createdAt: subscription.created_at,
        } satisfies AdminProUser;
      }),
    );

    return { users, total: users.length };
  });

export const cancelProUserSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const parsed = z.object({ subscriptionId: z.string().min(1) }).parse(data || {});
    return parsed;
  })
  .handler(async ({ context, data }) => {
    await assertDesignatedAdmin(context);
    const { getStripe } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("stripe_subscription_id", data.subscriptionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!subscription) throw new Error("Subscription not found");
    if (["canceled", "incomplete_expired", "unpaid"].includes(subscription.status)) {
      throw new Error("Subscription is no longer active");
    }

    const updated = await getStripe().subscriptions.update(data.subscriptionId, {
      cancel_at_period_end: true,
    });
    const currentPeriodEnd = new Date(updated.current_period_end * 1000).toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ cancel_at_period_end: true, current_period_end: currentPeriodEnd })
      .eq("stripe_subscription_id", data.subscriptionId);
    if (updateError) throw new Error(updateError.message);

    return { ok: true, cancelAtPeriodEnd: true, currentPeriodEnd };
  });
