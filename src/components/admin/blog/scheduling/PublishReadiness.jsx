import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

// Renders the validation result from validateBlogPostForPublishing:
// { valid, errors: [], recommendations: [] }
export default function PublishReadiness({ validation, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking readiness...
      </div>
    );
  }

  if (!validation) {
    return <p className="text-sm text-muted-foreground">Readiness will be checked before publishing.</p>;
  }

  const errors = validation.errors || [];
  const recommendations = validation.recommendations || [];

  if (errors.length === 0 && recommendations.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-500">
        <CheckCircle2 className="w-4 h-4" /> Ready to publish.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((e, i) => (
        <div key={`e-${i}`} className="flex items-start gap-2 text-sm text-destructive">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{e}</span>
        </div>
      ))}
      {recommendations.map((r, i) => (
        <div key={`r-${i}`} className="flex items-start gap-2 text-sm text-amber-500">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{r}</span>
        </div>
      ))}
      {errors.length === 0 && (
        <p className="text-xs text-muted-foreground pt-1">Recommendations are optional — you can still publish.</p>
      )}
    </div>
  );
}