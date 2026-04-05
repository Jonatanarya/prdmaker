"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PrdMarkdown } from "@/components/PrdMarkdown";

export default function ResultPage() {
  const [prd, setPrd] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrd(sessionStorage.getItem("prd_content"));
    setWarn(sessionStorage.getItem("prd_mermaid_warning"));
  }, []);

  const downloadMd = useCallback(() => {
    if (!prd) return;
    const blob = new Blob([prd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prd.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [prd]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Memuat…
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-zinc-400">Belum ada PRD. Mulai dari chat.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-emerald-400 hover:underline"
        >
          Kembali ke chat
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Hasil PRD</h1>
          {warn ? (
            <p className="mt-1 text-sm text-amber-400">Peringatan Mermaid: {warn}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadMd}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Unduh .md
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Chat lagi
          </Link>
        </div>
      </div>
      <PrdMarkdown source={prd} />
    </div>
  );
}