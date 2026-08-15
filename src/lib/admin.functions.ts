import { createServerFn } from "@tanstack/react-start";
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
