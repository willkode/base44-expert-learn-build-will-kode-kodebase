import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import GeneratorForm from "@/components/admin/blog/generator/GeneratorForm";
import GeneratorResult from "@/components/admin/blog/generator/GeneratorResult";

export default function BlogGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async (payload) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("generateBlogPost", payload);
      if (res.data?.success) {
        setResult({ post: res.data.post, generated: res.data.generated });
        toast.success("Article generated");
      } else {
        toast.error(res.data?.error || "Generation failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Generation failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader
        title="AI Blog Generator"
        description="Generate a complete, SEO-optimized article from a topic, keyword, and content goal."
      />

      {!result ? (
        <div className="relative">
          <GeneratorForm onGenerate={generate} loading={loading} />
          {loading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Writing your article — this can take up to a minute.</p>
            </div>
          )}
        </div>
      ) : (
        <GeneratorResult post={result.post} generated={result.generated} onReset={() => setResult(null)} />
      )}
    </div>
  );
}