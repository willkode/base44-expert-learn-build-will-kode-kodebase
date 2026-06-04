import React from "react";
import ReactMarkdown from "react-markdown";

export default function BlogContent({ content }) {
  if (!content || !content.trim()) {
    return <p className="text-muted-foreground italic">No content yet.</p>;
  }
  return (
    <ReactMarkdown
      className="text-foreground/90 max-w-none"
      components={{
        h1: ({ children }) => <h2 className="font-sora font-bold text-2xl mt-10 mb-4">{children}</h2>,
        h2: ({ children }) => <h3 className="font-sora font-bold text-xl mt-8 mb-3">{children}</h3>,
        h3: ({ children }) => <h4 className="font-sora font-semibold text-lg mt-6 mb-2">{children}</h4>,
        p: ({ children }) => <p className="my-4 leading-8 text-base text-muted-foreground">{children}</p>,
        ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground">{children}</ul>,
        ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground">{children}</ol>,
        li: ({ children }) => <li className="leading-7">{children}</li>,
        a: ({ children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-4 my-5 italic text-foreground/80">{children}</blockquote>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1.5 py-0.5 rounded bg-secondary text-primary text-sm font-mono">{children}</code>
          ) : (
            <pre className="bg-secondary rounded-xl p-4 overflow-x-auto my-5 text-sm font-mono">{children}</pre>
          ),
        img: ({ ...props }) => <img {...props} className="rounded-xl my-6 w-full" alt={props.alt || ""} />,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}