import { createFileRoute } from "@tanstack/react-router";
import { SettingsCard, EmptyState } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/chat")({
  head: () => ({
    meta: [
      { title: "Chat Settings — AI Video Bootcamp" },
      { name: "description", content: "Control who can send you direct messages." },
      { property: "og:title", content: "Chat Settings" },
      { property: "og:description", content: "Control who can send you direct messages." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <SettingsCard title="Chat" description="Control who is allowed to message you.">
      <div className="space-y-6">
        <div className="relative rounded-md border border-border px-4 py-4">
          <span className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground">
            Who can message me
          </span>
          <select className="w-full bg-transparent text-[17px] outline-none">
            <option>Everyone</option>
            <option>Members of my communities</option>
            <option>Nobody</option>
          </select>
        </div>
        <EmptyState title="Blocked members will show here" />
      </div>
    </SettingsCard>
  );
}
