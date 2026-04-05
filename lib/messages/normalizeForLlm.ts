export type IncomingChatMessage = {
  role?: unknown;
  content?: unknown;
  parts?: unknown;
};

function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(
      (p): p is { type: string; text?: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as { type?: string }).type === "text",
    )
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("");
}

/**
 * Converts AI SDK / useChat message shapes to simple { role, content } for the LLM.
 */
export function normalizeMessagesForLlm(
  messages: IncomingChatMessage[],
): Array<{ role: "user" | "assistant"; content: string }> {
  const out: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    let content =
      typeof m.content === "string" ? m.content : textFromParts(m.parts);
    content = content.trim();
    if (!content) continue;
    out.push({ role: m.role, content });
  }
  return out;
}