import { streamText } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/llm/client";
import { PRD_EXPERT_SYSTEM } from "@/lib/llm/prompts";
import { normalizeMessagesForLlm } from "@/lib/messages/normalizeForLlm";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z
  .object({
    id: z.string().optional(),
    messages: z.array(z.record(z.unknown())),
    data: z.unknown().optional(),
  })
  .passthrough();

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

  const messages = normalizeMessagesForLlm(parsed.data.messages);
  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid messages with content" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const model = getLanguageModel();
    const result = streamText({
      model,
      system: PRD_EXPERT_SYSTEM,
      messages,
    });
    return result.toDataStreamResponse();
  } catch (e) {
    const message = e instanceof Error ? e.message : "LLM configuration error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}