import type { CoreMessage } from "ai";

export type LLMProviderId = "groq" | "gemini" | "openrouter" | "xai";

export type StreamChatInput = {
  messages: CoreMessage[];
};

export type GeneratePrdInput = {
  messages: CoreMessage[];
};

export { type CoreMessage };