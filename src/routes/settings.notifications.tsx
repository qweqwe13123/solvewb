import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SettingsCard } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AI Video Bootcamp" },
      { name: "description", content: "Choose which emails and alerts you receive." },
      { property: "og:title", content: "Notifications" },
      { property: "og:description", content: "Choose which emails and alerts you receive." },
    ],
  }),
  component: NotificationsPage,
});

const rows = [
  ["Community posts", "New posts in communities you've joined"],
  ["Comments & replies", "Someone replies to you"],
  ["Direct messages", "New chat messages"],
  ["Product updates", "News and feature announcements"],
];

function NotificationsPage() {
  const [on, setOn] = useState<Record<string, boolean>>({
    "Community posts": true,
    "Comments & replies": true,
    "Direct messages": true,
    "Product updates": false,
  });

  return (
    <SettingsCard title="Notifications">
      <ul className="divide-y divide-border">
        {rows.map(([label, desc]) => (
          <li key={label} className="flex items-center justify-between gap-6 py-4">
            <div>
              <div className="font-bold">{label}</div>
              <div className="text-sm text-muted-foreground">{desc}</div>
            </div>
            <button
              aria-label={`Toggle ${label}`}
              onClick={() => setOn((p) => ({ ...p, [label!]: !p[label!] }))}
              className={`h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${
                on[label!] ? "bg-join" : "bg-muted"
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-card shadow transition-transform ${
                  on[label!] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}
