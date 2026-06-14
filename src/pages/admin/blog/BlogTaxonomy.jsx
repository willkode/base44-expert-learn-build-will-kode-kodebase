import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tags, Tag } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";

export default function BlogTaxonomy() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.BlogCategory.list("displayOrder", 500),
      base44.entities.BlogTag.list("-created_date", 1000),
    ]).then(([c, t]) => {
      setCategories(c);
      setTags(t);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Categories & Tags"
        description="Organize your blog content into categories and tags."
      />

      <section>
        <h2 className="font-sora font-semibold text-base mb-3">Categories</h2>
        <AdminTable
          columns={["Name", "Slug", "Active"]}
          rows={categories}
          loading={loading}
          emptyIcon={Tags}
          emptyTitle="No categories yet"
          emptyDescription="Categories group related posts and power category landing pages."
          renderRow={(c) => [
            <div className="font-medium">{c.name}</div>,
            <span className="text-xs text-muted-foreground">/{c.slug}</span>,
            <Badge variant={c.isActive ? "default" : "outline"} className="text-xs">{c.isActive ? "Active" : "Inactive"}</Badge>,
          ]}
        />
      </section>

      <section>
        <h2 className="font-sora font-semibold text-base mb-3">Tags</h2>
        <AdminTable
          columns={["Name", "Slug", "Active"]}
          rows={tags}
          loading={loading}
          emptyIcon={Tag}
          emptyTitle="No tags yet"
          emptyDescription="Tags add granular topics to posts for richer internal linking."
          renderRow={(t) => [
            <div className="font-medium">{t.name}</div>,
            <span className="text-xs text-muted-foreground">/{t.slug}</span>,
            <Badge variant={t.isActive ? "default" : "outline"} className="text-xs">{t.isActive ? "Active" : "Inactive"}</Badge>,
          ]}
        />
      </section>
    </div>
  );
}