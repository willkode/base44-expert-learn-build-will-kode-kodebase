import React, { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PromptGenerator({ project, onCreated }) {
  const [request, setRequest] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!request.trim()) return;
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        model: "gpt_5_5",
        prompt: `You are an expert Base44 prompt engineer. A user is building an app called "${project.projectName}". They described an issue or request below. Write a single, detailed, ready-to-paste Base44 prompt that fully solves it.\n\nUser request:\n"""${request}"""\n\nReturn a clear title, the most relevant category, the target area of the app, the purpose, and the full prompt text the user can paste directly into Base44.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: {
              type: "string",
              enum: ["UI Redesign", "Sales Copy", "SEO", "Conversion", "Performance"],
            },
            targetArea: { type: "string" },
            purpose: { type: "string" },
            promptText: { type: "string" },
          },
          required: ["title", "category", "promptText"],
        },
      });

      await base44.entities.OptimizationPrompt.create({
        projectId: project.id,
        category: result.category || "UI Redesign",
        title: result.title,
        targetArea: result.targetArea,
        purpose: result.purpose,
        promptText: result.promptText,
        status: "not_used",
      });

      toast.success("Prompt generated and saved");
      setRequest("");
      onCreated?.();
    } catch (err) {
      toast.error(err?.message || "Failed to generate prompt");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h2 className="font-sora font-semibold text-lg flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-primary" /> Describe a request
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        Describe an issue or request and AI will generate a ready-to-paste Base44 prompt to solve it.
      </p>
      <Textarea
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        placeholder="e.g. The pricing page feels cluttered and the CTA is hard to find..."
        className="mt-4 min-h-24"
      />
      <div className="flex justify-end mt-3">
        <Button
          onClick={generate}
          disabled={generating || !request.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4 mr-2" /> Generate prompt</>}
        </Button>
      </div>
    </div>
  );
}