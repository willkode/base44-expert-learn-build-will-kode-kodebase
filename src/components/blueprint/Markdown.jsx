import React from "react";
import ReactMarkdown from "react-markdown";

export default function Markdown({ content }) {
  if (!content || !content.trim()) {
    return <p className="text-sm text-muted-foreground italic">No content generated for this section.</p>;
  }
  return (
    <ReactMarkdown
      className="text-sm leading-relaxed text-foreground/90 max-w-none space-y-3"
      components={{
        h1: ({ children }) => <h2 className="font-sora font-semibold text-lg mt-4 mb-2">{children}</h2>,
        h2: ({ children }) => <h3 className="font-sora font-semibold text-base mt-4 mb-2">{children}</h3>,
        h3: ({ children }) => <h4 className="font-sora font-semibold text-sm mt-3 mb-1.5">{children}</h4>,
        p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1.5 py-0.5 rounded bg-secondary text-primary text-xs font-mono">{children}</code>
          ) : (
            <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-3 text-xs font-mono">{children}</pre>
          ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="text-left p-2 border border-border bg-secondary font-medium">{children}</th>,
        td: ({ children }) => <td className="p-2 border border-border align-top">{children}</td>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}