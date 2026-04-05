import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import type { LLMProviderId } from "./types";

function readProvider(): LLMProviderId {
  const raw = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  if (raw === "gemini" || raw === "openrouter" || raw === "xai") return raw;
  return "groq";
}

/**
 * Returns the configured chat/completion model for the active LLM_PROVIDER.
 * Keys: GROQ_API_KEY | GOOGLE_GENERATIVE_AI_API_KEY | OPENROUTER_API_KEY | XAI_API_KEY
 */
export function getLanguageModel(): LanguageModelV1 {
  const provider = readProvider();

  if (provider === "xai") {
    const key = process.env.XAI_API_KEY;
    if (!key) {
      throw new Error("LLM_PROVIDER=xai requires XAI_API_KEY");
    }
    const xai = createOpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: key,
    });
    const id = process.env.XAI_MODEL || "grok-2-latest";
    return xai(id);
  }

  if (provider === "gemini") {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      throw new Error(
        "LLM_PROVIDER=gemini requires GOOGLE_GENERATIVE_AI_API_KEY",
      );
    }
    const google = createGoogleGenerativeAI({ apiKey: key });
    const id = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    return google(id);
  }

  if (provider === "openrouter") {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error(
        "LLM_PROVIDER=openrouter requires OPENROUTER_API_KEY",
      );
    }
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: key,
    });
    const id =
      process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
    return openrouter(id);
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error("Default LLM_PROVIDER=groq requires GROQ_API_KEY");
  }
  const groq = createGroq({ apiKey: groqKey });
  const modelId = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  return groq(modelId);
}

export function getActiveProvider(): LLMProviderId {
  const raw = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  if (raw === "gemini" || raw === "openrouter" || raw === "xai") return raw;
  return "groq";
}