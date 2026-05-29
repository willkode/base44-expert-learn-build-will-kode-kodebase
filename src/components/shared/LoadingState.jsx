import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}