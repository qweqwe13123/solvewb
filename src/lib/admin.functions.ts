import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    // Grants the admin role only to the designated, email-verified account.
    const { data, error } = await context.supabase.rpc("claim_admin_role");
    if (error) return { isAdmin: false };
    return { isAdmin: data === true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ members: AdminMember[]; total: number }> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error("Не удалось загрузить список участников");

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
  });
