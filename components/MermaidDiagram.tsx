"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

let mermaidReady = false;

export function MermaidDiagram({ chart }: { chart: string }) {
  const uid = useId().replace(/:/g, "_");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidReady) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
      });
      mermaidReady = true;
    }

    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    setError(null);
    const id = `mmd_${uid}_${Date.now()}`;

    mermaid
      .render(id, chart.trim())
      .then(({ svg }) => {
        if (!cancelled) el.innerHTML = svg;
      })
      .catch(() => {
        if (!cancelled) {
          setError("Diagram tidak bisa dirender.");
          el.innerHTML = "";
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, uid]);

  return (
    <div className="my-4 w-full overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900/50 p-2 [&_svg]:max-w-none">
      {error ? (
        <p className="text-sm text-amber-400">{error}</p>
      ) : null}
      <div ref={containerRef} />
    </div>
  );
}