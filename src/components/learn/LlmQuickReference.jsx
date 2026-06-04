import React from "react";
import { MODELS } from "@/components/learn/llmModels";

export default function LlmQuickReference() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="px-5 py-4 font-sora font-semibold whitespace-nowrap">AI Model</th>
            <th className="px-5 py-4 font-sora font-semibold">Best At</th>
            <th className="px-5 py-4 font-sora font-semibold">Use It For</th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((m) => (
            <tr key={m.name} className="border-b border-border last:border-0 align-top">
              <td className="px-5 py-4 font-semibold text-primary whitespace-nowrap">{m.name}</td>
              <td className="px-5 py-4 text-muted-foreground">{m.bestAt}</td>
              <td className="px-5 py-4 text-muted-foreground">{m.useFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}