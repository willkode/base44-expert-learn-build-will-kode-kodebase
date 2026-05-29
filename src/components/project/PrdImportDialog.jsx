import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, ArrowLeft, FileText } from "lucide-react";

const APP_TYPES = ["SaaS", "Marketplace", "Internal tool", "CRM", "Directory", "Booking platform", "AI tool", "Client portal", "Other"];

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    appName: { type: "string", description: "Short product/app name" },
    shortDescription: { type: "string", description: "One or two sentence description of what the app does" },
    appType: { type: "string", enum: APP_TYPES, description: "Closest matching app type" },
    targetAudience: { type: "string", description: "Who the app is for" },
    userRoles: { type: "string", description: "User roles / personas" },
    mainFeatures: { type: "string", description: "Core features users can do" },
    userDashboardFeatures: { type: "string" },
    adminFeatures: { type: "string", description: "What admins manage" },
    searchNeeds: { type: "string" },
    aiFeatures: { type: "string", description: "Any AI-powered features mentioned" },
    externalApis: { type: "string", description: "Third-party services / integrations mentioned" },
    launchGoal: { type: "string" },
    notes: { type: "string", description: "Anything else relevant from the document" },
  },
};

export default function PrdImportDialog({ open, onOpenChange, onBack }) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: EXTRACT_SCHEMA,
      });
      if (result.status !== "success" || !result.output) {
        throw new Error(result.details || "Could not read that document.");
      }
      const data = { securityLevel: "standard", ...result.output };
      onOpenChange(false);
      navigate("/projects/new", { state: { prefill: data } });
    } catch (err) {
      setError(err.message || "Something went wrong reading your document. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">Import a PRD</DialogTitle>
          <DialogDescription>
            Upload any document or text file. We'll extract the details and pre-fill the wizard so you can review and edit before submitting.
          </DialogDescription>
        </DialogHeader>

        <label
          className={`mt-2 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 px-6 py-10 text-center transition-colors ${
            loading ? "opacity-60 pointer-events-none" : "cursor-pointer hover:border-primary/50 hover:bg-card"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Reading <span className="text-foreground font-medium">{fileName}</span>...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Click to upload your PRD</p>
                <p className="text-xs text-muted-foreground mt-0.5">PDF, Word, text, markdown — any document</p>
              </div>
            </>
          )}
          <input type="file" className="hidden" onChange={handleFile} disabled={loading} />
        </label>

        {fileName && !loading && !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {fileName}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-start pt-1">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}