import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Share2, PenSquare, ListChecks, Settings, Sparkles, Upload, Film } from "lucide-react";
import OcoyaVideoStudio from "@/components/admin/ocoya/video/OcoyaVideoStudio";
import OcoyaBulkImport from "@/components/admin/ocoya/OcoyaBulkImport";
import LoadingState from "@/components/shared/LoadingState";
import OcoyaCreatePost from "@/components/admin/ocoya/OcoyaCreatePost";
import OcoyaSuggest from "@/components/admin/ocoya/OcoyaSuggest";
import OcoyaPostsList from "@/components/admin/ocoya/OcoyaPostsList";
import OcoyaSettings from "@/components/admin/ocoya/OcoyaSettings";

export default function OcoyaSocial() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(localStorage.getItem("ocoya_workspace") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("create");

  useEffect(() => {
    base44.functions.invoke("ocoyaRequest", { action: "workspaces" }).then((res) => {
      if (res.data?.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }
      const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.workspaces || [];
      setWorkspaces(list);
      setWorkspaceId((prev) => (prev && list.some((w) => w.id === prev) ? prev : list[0]?.id || ""));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (workspaceId) localStorage.setItem("ocoya_workspace", workspaceId);
  }, [workspaceId]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Share2 className="w-5 h-5" />
        </span>
        <div>
          <h1 className="font-sora font-bold text-2xl tracking-tight">Social Publisher</h1>
          <p className="text-sm text-muted-foreground">
            AI-generated posts, published through your Ocoya account.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState label="Connecting to Ocoya..." />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 max-w-xl">
            <h3 className="font-sora font-semibold mb-2">Couldn't connect to Ocoya</h3>
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              Check that your Ocoya API key is valid — create one at app.ocoya.com → Settings → API.
            </p>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="create" className="gap-1.5">
                <PenSquare className="w-4 h-4" /> Create
              </TabsTrigger>
              <TabsTrigger value="suggest" className="gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Suggest
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-1.5">
                <Film className="w-4 h-4" /> Video
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-1.5">
                <Upload className="w-4 h-4" /> Bulk Import
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5">
                <ListChecks className="w-4 h-4" /> Posts
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="w-4 h-4" /> Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <OcoyaCreatePost workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="suggest">
              <OcoyaSuggest workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="video">
              <OcoyaVideoStudio workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="bulk">
              <OcoyaBulkImport onViewDrafts={() => setTab("suggest")} />
            </TabsContent>
            <TabsContent value="posts">
              <OcoyaPostsList workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="settings">
              <OcoyaSettings workspaceId={workspaceId} workspaces={workspaces} onWorkspaceChange={setWorkspaceId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}