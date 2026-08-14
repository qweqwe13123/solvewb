import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { SettingsCard, Field, TextInput } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile Settings — AI Video Bootcamp" },
      { name: "description", content: "Edit your name, URL, bio and location." },
      { property: "og:title", content: "Profile Settings" },
      { property: "og:description", content: "Edit your name, URL, bio and location." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const [bio, setBio] = useState("");
  const avatar = user?.user_metadata?.["avatar_url"] as string | undefined;
  const fullName = ((user?.user_metadata?.["full_name"] as string) ?? "").split(" ");

  return (
    <SettingsCard title="Profile">
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile photo"
              width={64}
              height={64}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="size-16 rounded-full bg-muted" />
          )}
          <button className="text-[15px] font-bold text-brand">Change profile photo</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            hint={
              <>
                You can only change your name once, and you must use your real name.{" "}
                <button className="font-medium text-brand">Change name</button>
              </>
            }
          >
            <TextInput defaultValue={fullName[0] ?? ""} placeholder="First name" />
          </Field>
          <Field label="Last Name">
            <TextInput defaultValue={fullName[1] ?? ""} placeholder="Last name" />
          </Field>
        </div>

        <Field
          label="URL"
          hint="You can change your URL once you've got 90 contributions, 30 followers, and been using the platform for 90 days."
        >
          <TextInput
            defaultValue={`skool.com/@${(user?.email ?? "member").split("@")[0]}`}
          />
        </Field>

        <div>
          <div className="relative rounded-md border border-border px-4 pt-4 pb-2">
            <span className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground">
              Bio
            </span>
            <textarea
              value={bio}
              maxLength={150}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-[17px] outline-none"
              placeholder="Tell people about yourself"
            />
          </div>
          <p className="mt-1 text-right text-sm text-muted-foreground">{bio.length} / 150</p>
        </div>

        <Field label="Location">
          <TextInput placeholder="Location" />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[15px]">
          <button className="font-medium text-brand">Change my map location</button>
          <button className="text-muted-foreground">Remove my map location</button>
        </div>

        <Field label="Myers Briggs">
          <select className="w-full bg-transparent text-[17px] outline-none">
            <option>Don&apos;t show</option>
            <option>INTJ</option>
            <option>ENFP</option>
          </select>
        </Field>

        <button className="rounded-lg bg-join px-6 py-3 text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90">
          Save changes
        </button>
      </div>
    </SettingsCard>
  );
}
