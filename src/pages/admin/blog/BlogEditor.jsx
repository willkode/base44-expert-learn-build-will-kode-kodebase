import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Copy, Archive, RotateCcw, ExternalLink, Loader2, Check,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MarkdownEditor from "@/components/admin/blog/editor/MarkdownEditor";
import SeoFields from "@/components/admin/blog/editor/SeoFields";
import EditorSidebar from "@/components/admin/blog/editor/EditorSidebar";
import SeoScorePanel from "@/components/admin/blog/editor/SeoScorePanel";
import {
  DesktopPreview, MobilePreview, SearchPreview, SocialPreview, TocPreview,
} from "@/components/admin/blog/editor/EditorPreviews";
import { slugify, checkSlug } from "@/lib/slug";
import { countWords, readingMinutes } from "@/lib/blogEditor";
import { trackEvent } from "@/lib/analytics";

const EMPTY = {
  title: "", slug: "", excerpt: "", content: "", category: "", categoryId: "",
  author: "", coverImageUrl: "", featuredImageAlt: "", metaTitle: "", metaDescription: "",
  canonicalUrl: "", ogTitle: "", ogDescription: "", ogImageUrl: "", twitterTitle: "",
  twitterDescription: "", twitterImageUrl: "", status: "draft", scheduledAt: "",
  postType: "blog_post", searchIntent: "informational", targetKeyword: "", revisionNotes: "",
  tagIds: [],
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [post, setPost] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(id || null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [slugError, setSlugError] = useState("");
  const [validation, setValidation] = useState(null);
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const dirty = useRef(false);
  const autosaveTimer = useRef(null);

  // Load categories + existing post
  useEffect(() => {
    base44.entities.BlogCategory.list("displayOrder", 200).then(setCategories);
    if (isNew) return;
    base44.entities.BlogPost.filter({ id }).then((rows) => {
      if (rows[0]) {
        setPost({ ...EMPTY, ...rows[0] });
        setTagsText((rows[0].tags || []).join(", "));
      } else {
        toast.error("Post not found");
        navigate("/admin/marketing/blog/posts");
      }
      setLoading(false);
    });
  }, [id, isNew, navigate]);

  const set = useCallback((k, v) => {
    dirty.current = true;
    setPost((p) => {
      const next = { ...p, [k]: v };
      // Auto-generate slug from title until the slug is manually edited.
      if (k === "title" && !slugTouched) next.slug = slugify(v);
      return next;
    });
  }, [slugTouched]);

  const onSlugChange = (v) => {
    setSlugTouched(true);
    dirty.current = true;
    setPost((p) => ({ ...p, slug: v }));
    setSlugError(checkSlug(v).errors[0] || "");
  };

  // Build the payload sent to backend (resolve tags from text).
  const buildPayload = useCallback(() => {
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    return { ...post, tags };
  }, [post, tagsText]);

  const save = useCallback(async ({ silent } = {}) => {
    if (!post.title?.trim()) {
      if (!silent) toast.error("Title is required");
      return null;
    }
    if (slugTouched && !checkSlug(post.slug).valid) {
      if (!silent) toast.error("Fix the slug before saving");
      return null;
    }
    // Block publishing while critical SEO issues remain (manual saves only).
    if (!silent && ["published", "scheduled"].includes(post.status) && seoAnalysis?.critical_issues?.length) {
      toast.error("Resolve the critical SEO issues before publishing");
      return null;
    }
    setSaving(true);
    const payload = buildPayload();
    try {
      let res;
      if (savedId) {
        res = await base44.functions.invoke("updateBlogPost", { ...payload, id: savedId });
      } else {
        res = await base44.functions.invoke("createBlogPost", payload);
      }
      if (res.data?.success) {
        const saved = res.data.post;
        setSavedId(saved.id);
        setPost((p) => ({ ...EMPTY, ...saved, ...p, id: saved.id, slug: saved.slug }));
        setLastSaved(new Date());
        dirty.current = false;
        if (!silent) {
          toast.success(isNew && !savedId ? "Post created" : "Saved");
          trackEvent("blog_post_saved", { is_new: !savedId, status: saved.status });
        }
        return saved;
      }
      if (!silent) toast.error(res.data?.error || "Save failed");
      return null;
    } catch (err) {
      if (!silent) toast.error(err?.response?.data?.error || "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }, [post, savedId, slugTouched, buildPayload, isNew, seoAnalysis]);

  // Apply an AI SEO fix returned by the panel into the local post state.
  const onFieldFixed = useCallback((field, value) => {
    dirty.current = true;
    setPost((p) => ({ ...p, [field]: value }));
  }, []);

  // Autosave: 4s after the last edit, only for already-saved posts.
  useEffect(() => {
    if (!savedId) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (dirty.current) save({ silent: true });
    }, 4000);
    return () => autosaveTimer.current && clearTimeout(autosaveTimer.current);
  }, [post, tagsText, savedId, save]);

  const runValidation = useCallback(async () => {
    const res = await base44.functions.invoke("validateBlogPostForPublishing", {
      post: { ...buildPayload(), id: savedId },
      intendedStatus: post.status,
    });
    if (res.data?.success) setValidation({ errors: res.data.errors, recommendations: res.data.recommendations });
  }, [buildPayload, savedId, post.status]);

  useEffect(() => {
    const t = setTimeout(runValidation, 800);
    return () => clearTimeout(t);
  }, [runValidation]);

  const duplicate = async () => {
    if (!savedId) { toast.error("Save the post first"); return; }
    const res = await base44.functions.invoke("duplicateBlogPost", { id: savedId });
    if (res.data?.success) {
      toast.success("Duplicated");
      navigate(`/admin/marketing/blog/posts/${res.data.post.id}/edit`);
    } else toast.error(res.data?.error || "Duplicate failed");
  };

  const archive = async () => {
    if (!savedId) return;
    const res = await base44.functions.invoke("archiveBlogPost", { id: savedId });
    if (res.data?.success) { setPost((p) => ({ ...p, status: "archived" })); toast.success("Archived"); }
    else toast.error(res.data?.error || "Archive failed");
  };

  const restore = async () => {
    const res = await base44.functions.invoke("restoreBlogPost", { id: savedId });
    if (res.data?.success) { setPost((p) => ({ ...p, status: "draft", approvalStatus: "draft" })); toast.success("Restored to draft"); }
    else toast.error(res.data?.error || "Restore failed");
  };

  if (loading) return <LoadingState label="Loading editor..." />;

  const wordCount = countWords(post.content);
  const readMinutes = readingMinutes(post.content);

  return (
    <div>
      <PageHeader
        title={isNew && !savedId ? "New Post" : "Edit Post"}
        description={
          <span className="flex items-center gap-2">
            <Link to="/admin/marketing/blog/posts" className="inline-flex items-center gap-1 text-sm hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to posts
            </Link>
            {lastSaved && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Saved {lastSaved.toLocaleTimeString()}</span>}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {post.status === "archived"
              ? <Button variant="outline" size="sm" onClick={restore} className="gap-1.5"><RotateCcw className="w-4 h-4" /> Restore</Button>
              : <Button variant="outline" size="sm" onClick={archive} disabled={!savedId} className="gap-1.5"><Archive className="w-4 h-4" /> Archive</Button>}
            <Button variant="outline" size="sm" onClick={duplicate} disabled={!savedId} className="gap-1.5"><Copy className="w-4 h-4" /> Duplicate</Button>
            {savedId && post.slug && (
              <a href={`/learn/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" title="View public page"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            )}
            <Button size="sm" onClick={() => save()} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <Tabs defaultValue="write">
            <TabsList className="mb-5">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-5">
              <div>
                <Label className="mb-1.5 block">Title</Label>
                <Input value={post.title} onChange={(e) => set("title", e.target.value)} placeholder="Your post title" className="text-lg" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Slug</Label>
                  {post.slug && <span className="text-xs text-muted-foreground">/learn/blog/{post.slug}</span>}
                </div>
                <Input value={post.slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="url-friendly-slug" />
                {slugError && <p className="text-xs text-destructive mt-1">{slugError}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block">Excerpt</Label>
                <Textarea value={post.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="h-16" placeholder="Short summary shown on listings" />
              </div>
              <div>
                <Label className="mb-1.5 block">Featured image URL</Label>
                <Input value={post.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label className="mb-1.5 block">Featured image alt text</Label>
                <Input value={post.featuredImageAlt} onChange={(e) => set("featuredImageAlt", e.target.value)} placeholder="Describe the image" />
              </div>
              <div>
                <Label className="mb-1.5 block">Content</Label>
                <MarkdownEditor value={post.content} onChange={(v) => set("content", v)} />
              </div>
            </TabsContent>

            <TabsContent value="seo">
              <SeoFields post={post} set={set} />
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <SearchPreview post={post} />
              <SocialPreview post={post} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MobilePreview post={post} />
                <TocPreview post={post} />
              </div>
              <DesktopPreview post={post} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-5">
          <SeoScorePanel
            postId={savedId}
            content={post.content}
            onFieldFixed={onFieldFixed}
            onAnalysis={setSeoAnalysis}
          />
          <EditorSidebar
            post={post}
            set={set}
            categories={categories}
            tagsText={tagsText}
            onTagsText={(v) => { dirty.current = true; setTagsText(v); }}
            wordCount={wordCount}
            readMinutes={readMinutes}
            validation={validation}
          />
        </div>
      </div>
    </div>
  );
}