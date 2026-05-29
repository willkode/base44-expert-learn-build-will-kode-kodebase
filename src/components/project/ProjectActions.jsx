import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, FileText, Wand2, ShieldCheck, ClipboardCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectActions({ project, hasBlueprint, hasPromptPack, generating, onGenerate }) {
  const navigate = useNavigate();
  const base = `/projects/${project.id}`;

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onGenerate} disabled={generating} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
        {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Base44 Blueprint</>}
      </Button>

      {hasBlueprint && (
        <Button variant="outline" onClick={() => navigate(`${base}/blueprint`)}>
          <FileText className="w-4 h-4 mr-2" /> View Blueprint
        </Button>
      )}
      {hasPromptPack && (
        <Button variant="outline" onClick={() => navigate(`${base}/prompts`)}>
          <Wand2 className="w-4 h-4 mr-2" /> View Prompt Pack
        </Button>
      )}
      {hasBlueprint && (
        <Button variant="outline" onClick={() => navigate(`${base}/security`)}>
          <ShieldCheck className="w-4 h-4 mr-2" /> Run Security Review
        </Button>
      )}
      {hasBlueprint && (
        <Button variant="outline" onClick={() => navigate(`${base}/qa`)}>
          <ClipboardCheck className="w-4 h-4 mr-2" /> Run QA Checklist
        </Button>
      )}
    </div>
  );
}