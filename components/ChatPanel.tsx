"use client";

import { useChat } from "ai/react";
import type { UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { normalizeMessagesForLlm, type IncomingChatMessage } from "@/lib/messages/normalizeForLlm";

function textFromMessage(m: UIMessage): string {
  if (m.content) return m.content;
  return (
    m.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("") ?? ""
  );
}

const WELCOME_TEXT =
  "Hi! I am your PRD Expert. What product do you want to build — who is it for, and what problem does it solve?";

export function ChatPanel() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      api: "/api/chat",
      streamProtocol: "data",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: WELCOME_TEXT,
        },
      ],
    });

  const busy = status === "submitted" || status === "streaming";
  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const onGenerate = useCallback(async () => {
    const payload = normalizeMessagesForLlm(messages as IncomingChatMessage[]);
    if (payload.length === 0) {
      setGenError("Chat dulu dengan AI sebelum generate PRD.");
      return;
    }
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = (await res.json()) as {
        prd?: string;
        error?: string;
        mermaidWarning?: string;
      };
      if (!res.ok) {
        setGenError(data.error || "Generate gagal");
        return;
      }
      if (!data.prd) {
        setGenError("Respons kosong dari server");
        return;
      }
      sessionStorage.setItem("prd_content", data.prd);
      if (data.mermaidWarning) {
        sessionStorage.setItem("prd_mermaid_warning", data.mermaidWarning);
      } else {
        sessionStorage.removeItem("prd_mermaid_warning");
      }
      router.push("/result");
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }, [messages, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">PRD Maker</h1>
        <p className="text-xs text-zinc-500">
          Chat dengan AI, lalu Generate PRD untuk preview + unduh .md
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m) =>
            m.role === "user" || m.role === "assistant" ? (
              <ChatMessageBubble
                key={m.id}
                role={m.role}
                content={textFromMessage(m)}
              />
            ) : null,
          )}
          {busy ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-800 px-4 py-2 text-sm text-zinc-400">
                Mengetik…
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="px-4 text-sm text-red-400">{error.message}</p>
        ) : null}
        {genError ? (
          <p className="px-4 text-sm text-red-400">{genError}</p>
        ) : null}

        <div className="border-t border-zinc-800 p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Jelaskan ide produk Anda…"
                rows={2}
                disabled={busy}
                className="min-h-[44px] flex-1 resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
              />
              <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-40"
                >
                  Kirim
                </button>
                <button
                  type="button"
                  onClick={() => void onGenerate()}
                  disabled={busy || generating || !hasUserMessage}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  {generating ? "Membuat PRD…" : "Generate PRD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}