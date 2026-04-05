import { generateText, type CoreMessage } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/llm/client";
import {
  PRD_GENERATION_SYSTEM,
  prdRetryUserMessage,
} from "@/lib/llm/prompts";
import { formatValidationReasons, validatePrdMermaid } from "@/lib/llm/mermaid";
import { normalizeMessagesForLlm } from "@/lib/messages/normalizeForLlm";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z
  .object({
    messages: z.array(z.record(z.unknown())),
  })
  .passthrough();

const GENERATE_USER: CoreMessage = {
  role: "user",
  content:
    "Using the conversation above, produce the complete PRD in Markdown now. Follow the system instructions exactly.",
};

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const normalized = normalizeMessagesForLlm(parsed.data.messages);
  if (normalized.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid messages with content" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let model;
  try {
    model = getLanguageModel();
  } catch (e) {
    const message = e instanceof Error ? e.message : "LLM configuration error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseMessages: CoreMessage[] = [...normalized, GENERATE_USER];

  let text = "";
  let mermaidOk = false;
  let mermaidWarning: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: CoreMessage[] =
      attempt === 0
        ? baseMessages
        : [
            ...baseMessages,
            { role: "assistant", content: text },
            {
              role: "user",
              content: prdRetryUserMessage(
                formatValidationReasons(validatePrdMermaid(text)),
              ),
            },
          ];

    const { text: out } = await generateText({
      model,
      system: PRD_GENERATION_SYSTEM,
      messages,
      maxTokens: 8192,
    });

    text = out;
    const validation = validatePrdMermaid(text);
    if (validation.ok) {
      mermaidOk = true;
      break;
    }
    mermaidWarning = formatValidationReasons(validation);
  }

  return Response.json({
    prd: text,
    mermaidOk,
    ...(mermaidWarning && !mermaidOk ? { mermaidWarning } : {}),
  });
}