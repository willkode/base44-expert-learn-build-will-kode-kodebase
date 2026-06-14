import React from "react";
import { Cog } from "lucide-react";
import { SettingsCard, TextField, AreaField, SelectField, ToggleRow } from "./SettingsField";

export default function GeneralSection({ s, set }) {
  return (
    <SettingsCard icon={Cog} title="General Blog Settings" description="Core blog identity and public display options.">
      <ToggleRow label="Enable blog" hint="Show the public blog. When off, public blog pages are hidden." checked={s.blogEnabled} onChange={(v) => set("blogEnabled", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Blog name" value={s.blogName} onChange={(v) => set("blogName", v)} />
        <TextField label="Public blog route" value={s.publicBlogRoute} onChange={(v) => set("publicBlogRoute", v)} placeholder="/learn/blog" />
      </div>
      <AreaField label="Blog description" value={s.blogDescription} onChange={(v) => set("blogDescription", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Posts per page" type="number" value={s.postsPerPage ?? 12} onChange={(v) => set("postsPerPage", v)} />
        <TextField label="Default language" value={s.defaultLanguage} onChange={(v) => set("defaultLanguage", v)} placeholder="en" />
        <TextField label="Default timezone" value={s.defaultTimezone} onChange={(v) => set("defaultTimezone", v)} placeholder="America/Chicago" />
      </div>
      <div className="space-y-3">
        <ToggleRow label="Show author box" hint="Display author info on posts." checked={s.showAuthorBox} onChange={(v) => set("showAuthorBox", v)} />
        <ToggleRow label="Show related posts" hint="Display related posts in the sidebar." checked={s.showRelatedPosts} onChange={(v) => set("showRelatedPosts", v)} />
        <ToggleRow label="Show table of contents" hint="Render a TOC on long posts." checked={s.showTableOfContents} onChange={(v) => set("showTableOfContents", v)} />
        <ToggleRow label="Allow comments" hint="Enable commenting on posts (if supported)." checked={s.allowComments} onChange={(v) => set("allowComments", v)} />
      </div>
    </SettingsCard>
  );
}