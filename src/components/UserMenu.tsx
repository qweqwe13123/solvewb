import { Link, useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { Globe, Shield, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getIsAdmin } from "@/lib/admin.functions";
import { checkCommunityAccessFn } from "@/lib/community.functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ user }: { user: User }) {
  const navigate = useNavigate();
  const name = (user.user_metadata?.["full_name"] as string) ?? user.email ?? "Account";
  const avatar = user.user_metadata?.["avatar_url"] as string | undefined;
  const checkAdmin = useServerFn(getIsAdmin);
  const checkAccess = useServerFn(checkCommunityAccessFn);
  const { data: adminData } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: () => checkAdmin(),
  });
  const { data: accessData } = useQuery({
    queryKey: ["community-access-status", user.id, user.email],
    queryFn: () => checkAccess({ data: { userId: user.id, email: user.email } }),
  });
  const isAdmin = adminData?.isAdmin === true;
  const isPro = accessData?.hasAccess === true && !isAdmin;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-muted text-sm font-semibold">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-xl p-0 py-1">
        <DropdownMenuLabel className="px-4 py-3">
          <div className="truncate text-[15px] font-bold text-foreground">{user.email}</div>
          {isAdmin ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Shield className="size-3.5" /> Administrator
            </div>
          ) : isPro ? (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm">
              <Sparkles className="size-3.5 fill-amber-500" /> PRO USER
            </div>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          {isAdmin ? (
            <DropdownMenuItem asChild className="gap-2 px-4 py-2.5 text-[15px] font-bold">
              <Link to="/admin">
                <Shield className="size-4" /> Admin panel
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem asChild className="px-4 py-2.5 text-[15px] font-bold">
            <Link to="/settings/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="px-4 py-2.5 text-[15px] font-bold">
            <Link to="/settings/account">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="px-4 py-2.5 text-[15px] font-bold">
            <Link to="/settings/affiliates">Affiliates</Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1 text-muted-foreground">
          <DropdownMenuItem className="gap-2 px-4 py-2.5 text-[15px]">
            <Globe className="size-4" /> Language
          </DropdownMenuItem>
          <DropdownMenuItem className="px-4 py-2.5 text-[15px]">Help center</DropdownMenuItem>
          <DropdownMenuItem onClick={signOut} className="px-4 py-2.5 text-[15px]">
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
