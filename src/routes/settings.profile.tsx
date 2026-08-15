import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { SettingsCard, Field, TextInput } from "@/components/settings/SettingsCard";
import { getCommunity, saveCommunityProfile } from "@/lib/community.functions";
import { uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile Settings — AI Video Bootcamp" },
      { name: "description", content: "Edit your name, URL, bio and profile picture." },
      { property: "og:title", content: "Profile Settings" },
      { property: "og:description", content: "Edit your name, URL, bio and profile picture." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const fetchCommunity = useServerFn(getCommunity);
  const saveProfileFn = useServerFn(saveCommunityProfile);

  const { data: communityData } = useQuery({
    queryKey: ["community"],
    queryFn: () => fetchCommunity(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      const metaName = (user.user_metadata["full_name"] as string) || (user.user_metadata["name"] as string) || "";
      const parts = metaName.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setAvatar(user.user_metadata["avatar_url"] as string ?? null);
    } else if (communityData?.profile?.ownerLabel) {
      const clean = communityData.profile.ownerLabel.replace(/^By\s+/i, "");
      const parts = clean.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      if (communityData.profile.ownerAvatar) {
        setAvatar(communityData.profile.ownerAvatar);
      }
    }
  }, [user, communityData]);

  async function handleAvatarUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "avatars");
      setAvatar(url);
      toast.success("Фотография профиля выбрана");
    } catch {
      toast.error("Не удалось загрузить фотографию");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      // 1. Update Supabase Auth user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            name: fullName,
            avatar_url: avatar,
          },
        });
      }

      // 2. Sync with Community Profile ownerLabel & ownerAvatar
      if (communityData?.profile) {
        const ownerLabelText = fullName ? `By ${fullName}` : communityData.profile.ownerLabel;
        await saveProfileFn({
          data: {
            ...communityData.profile,
            ownerLabel: ownerLabelText,
            ownerAvatar: avatar,
          },
        });
        qc.invalidateQueries({ queryKey: ["community"] });
        qc.invalidateQueries({ queryKey: ["admin-community"] });
      }

      toast.success("Профиль успешно сохранён и синхронизирован!");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Profile">
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative size-16 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile photo"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {(firstName[0] || user?.email?.[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent">
            <Upload className="size-4" />
            {uploading ? "Загрузка…" : "Change profile photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name">
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </Field>
          <Field label="Last Name">
            <TextInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </Field>
        </div>

        <Field
          label="URL"
          hint="Your community handle on the platform."
        >
          <TextInput
            defaultValue={`skool.com/@${(user?.email ?? "member").split("@")[0]}`}
            disabled
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
              className="w-full resize-none bg-transparent text-[15px] outline-none"
              placeholder="Tell people about yourself"
            />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length} / 150</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="rounded-lg bg-join px-6 py-3 text-sm font-bold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
        >
          {saving ? "Сохраняем…" : "Save changes"}
        </button>
      </div>
    </SettingsCard>
  );
}
