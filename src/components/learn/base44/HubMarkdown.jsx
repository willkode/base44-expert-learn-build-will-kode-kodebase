import React from "react";
import ReactMarkdown from "react-markdown";

// Renders inline `code` and **bold** inside table cells
function InlineCell({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-secondary text-primary text-xs font-mono">
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function MdTable({ lines }) {
  const rows = lines
    .map((l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()))
    .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c)));
  const [header, ...body] = rows;
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/60">
            {header.map((c, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-sora font-semibold text-foreground">
                <InlineCell text={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((cells, r) => (
            <tr key={r} className="border-t border-border">
              {cells.map((c, i) => (
                <td key={i} className="px-4 py-2.5 align-top text-muted-foreground">
                  <InlineCell text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mdComponents = {
  h1: ({ children }) => <h2 className="font-sora font-bold text-2xl mt-10 mb-4">{children}</h2>,
  h2: ({ children }) => <h3 className="font-sora font-bold text-xl mt-8 mb-3">{children}</h3>,
  h3: ({ children }) => <h4 className="font-sora font-semibold text-lg mt-6 mb-2">{children}</h4>,
  h4: ({ children }) => <h5 className="font-sora font-semibold text-base mt-5 mb-2">{children}</h5>,
  p: ({ children }) => <p className="my-4 leading-7 text-[15px] text-muted-foreground">{children}</p>,
  ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-1.5 text-muted-foreground text-[15px]">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-1.5 text-muted-foreground text-[15px]">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/50 bg-primary/5 rounded-r-lg pl-4 pr-4 py-1 my-5 text-foreground/80">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-secondary text-primary text-sm font-mono">{children}</code>
    ) : (
      <pre className="bg-secondary/70 border border-border rounded-xl p-4 overflow-x-auto my-5 text-[13px] leading-6 font-mono">
        {children}
      </pre>
    ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  hr: () => <hr className="my-8 border-border" />,
};

// Splits markdown into table blocks and regular markdown, since react-markdown
// (without GFM) can't render pipe tables.
export default function HubMarkdown({ content }) {
  const lines = content.split("\n");
  const segments = [];
  let buffer = [];
  let inCode = false;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) inCode = !inCode;
    if (!inCode && line.trim().startsWith("|") && lines[i + 1]?.trim().startsWith("|")) {
      if (buffer.length) segments.push({ type: "md", text: buffer.join("\n") });
      buffer = [];
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      segments.push({ type: "table", lines: tableLines });
    } else {
      buffer.push(line);
      i++;
    }
  }
  if (buffer.length) segments.push({ type: "md", text: buffer.join("\n") });

  return (
    <div className="max-w-none">
      {segments.map((seg, idx) =>
        seg.type === "table" ? (
          <MdTable key={idx} lines={seg.lines} />
        ) : (
          <ReactMarkdown key={idx} components={mdComponents}>
            {seg.text}
          </ReactMarkdown>
        )
      )}
    </div>
  );
}