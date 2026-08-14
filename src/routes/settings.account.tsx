import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { SettingsCard, Field, TextInput } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/account")({
  head: () => ({
    meta: [
      { title: "Account Settings — AI Video Bootcamp" },
      { name: "description", content: "Manage your email, password and account access." },
      { property: "og:title", content: "Account Settings" },
      { property: "og:description", content: "Manage your email, password and account access." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useSession();
  const navigate = useNavigate();

  return (
    <SettingsCard title="Account">
      <div className="space-y-6">
        <Field label="Email" hint="Signed in with Google.">
          <TextInput value={user?.email ?? ""} readOnly />
        </Field>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors hover:bg-accent"
          >
            Log out
          </button>
          <button className="rounded-lg px-6 py-3 text-sm font-semibold tracking-wide text-destructive uppercase transition-colors hover:bg-accent">
            Delete account
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}
