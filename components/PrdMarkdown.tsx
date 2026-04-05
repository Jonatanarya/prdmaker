"use client";

import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import { MermaidDiagram } from "@/components/MermaidDiagram";

const components: Components = {
  pre: ({ children }) => (
    <div className="my-2 w-full overflow-x-auto">{children}</div>
  ),
  code(props) {
    const { children, className } = props;
    const text = String(children).replace(/\n$/, "");
    const match = /language-(\w+)/.exec(className || "");
    if (match?.[1] === "mermaid") {
      return <MermaidDiagram chart={text} />;
    }
    if (match) {
      return (
        <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-200">
          <code className={className}>{text}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-200">
        {children}
      </code>
    );
  },
  h1: (p) => (
    <h1 className="mb-3 mt-8 text-2xl font-bold text-zinc-50" {...p} />
  ),
  h2: (p) => (
    <h2 className="mb-2 mt-6 text-xl font-semibold text-zinc-100" {...p} />
  ),
  h3: (p) => (
    <h3 className="mb-2 mt-4 text-lg font-medium text-zinc-200" {...p} />
  ),
  p: (p) => <p className="mb-3 text-zinc-300 leading-relaxed" {...p} />,
  ul: (p) => (
    <ul className="mb-3 list-inside list-disc space-y-1 text-zinc-300" {...p} />
  ),
  ol: (p) => (
    <ol className="mb-3 list-inside list-decimal space-y-1 text-zinc-300" {...p} />
  ),
  li: (p) => <li className="leading-relaxed" {...p} />,
  strong: (p) => <strong className="font-semibold text-zinc-100" {...p} />,
  a: (p) => (
    <a className="text-emerald-400 underline hover:text-emerald-300" {...p} />
  ),
};

export function PrdMarkdown({ source }: { source: string }) {
  return (
    <article className="prd-md max-w-none px-1">
      <Markdown components={components}>{source}</Markdown>
    </article>
  );
}