import React from "react";
import { UserCircle } from "lucide-react";
import { SettingsCard, TextField, AreaField } from "./SettingsField";

export default function AuthorSection({ s, set }) {
  return (
    <SettingsCard icon={UserCircle} title="Default Author" description="Used when a post has no specific author assigned.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Author name" value={s.defaultAuthorName} onChange={(v) => set("defaultAuthorName", v)} />
        <TextField label="Author avatar URL" value={s.defaultAuthorAvatarUrl} onChange={(v) => set("defaultAuthorAvatarUrl", v)} placeholder="https://..." />
      </div>
      <AreaField label="Author bio" value={s.defaultAuthorBio} onChange={(v) => set("defaultAuthorBio", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Website" value={s.defaultAuthorWebsite} onChange={(v) => set("defaultAuthorWebsite", v)} placeholder="https://..." />
        <TextField label="Twitter / X" value={s.defaultAuthorTwitter} onChange={(v) => set("defaultAuthorTwitter", v)} placeholder="@handle" />
        <TextField label="LinkedIn" value={s.defaultAuthorLinkedin} onChange={(v) => set("defaultAuthorLinkedin", v)} placeholder="https://..." />
      </div>
    </SettingsCard>
  );
}