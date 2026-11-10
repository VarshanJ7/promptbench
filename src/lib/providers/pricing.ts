import type { ProviderId } from "./types";

export type ModelInfo = {
  provider: ProviderId;
  label: string;
  inputPerMillion: number; // USD per 1M input tokens
  outputPerMillion: number; // USD per 1M output tokens (thinking tokens included)
};

// Standard (non-batch) prices, checked against each provider's official
// pricing page on 2026-11-10:
//   OpenAI:    https://developers.openai.com/api/docs/pricing
//   Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
//   Google:    https://aistudio.google.com/docs/pricing
// Cached-input discounts are ignored, so costs for long repeated prompts may
// come out slightly high. Anything not confirmed on those pages is marked
// "// UNVERIFIED" and listed in the README.
export const MODELS: Record<string, ModelInfo> = {
  // ---- OpenAI ----
  "gpt-5-nano": {
    provider: "openai",
    label: "GPT-5 nano",
    inputPerMillion: 0.05,
    outputPerMillion: 0.4,
  },
  "gpt-5-mini": {
    provider: "openai",
    label: "GPT-5 mini",
    inputPerMillion: 0.25,
    outputPerMillion: 2.0,
  },
  "gpt-4.1-mini": {
    provider: "openai",
    label: "GPT-4.1 mini",
    inputPerMillion: 0.4,
    outputPerMillion: 1.6,
  },
  "gpt-4o-mini": {
    provider: "openai",
    label: "GPT-4o mini",
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
  },

  // ---- Anthropic ----
  // Haiku 5.5 price is for prompts up to 100K tokens (it rises to $0.50 / $2.50
  // above that). PromptBench prompts are far below that.
  "claude-haiku-5-5": {
    provider: "anthropic",
    label: "Claude Haiku 5.5",
    inputPerMillion: 0.1,
    outputPerMillion: 0.5,
  },
  "claude-sonnet-5-5": {
    provider: "anthropic",
    label: "Claude Sonnet 5.5",
    inputPerMillion: 2.0,
    outputPerMillion: 10.0,
  },
  "claude-opus-5-5": {
    provider: "anthropic",
    label: "Claude Opus 5.5",
    inputPerMillion: 4.0,
    outputPerMillion: 20.0,
  },

  // ---- Google Gemini ----
  "gemini-2.5-flash-lite": {
    provider: "gemini",
    label: "Gemini 2.5 Flash-Lite",
    inputPerMillion: 0.1,
    outputPerMillion: 0.4,
  },
  "gemini-3.1-flash-lite": {
    provider: "gemini",
    label: "Gemini 3.1 Flash-Lite",
    inputPerMillion: 0.25,
    outputPerMillion: 1.5,
  },
  // Google lists a price rise to $1.50 / $7.50 starting 2027-01-01.
  // Update this row then.
  "gemini-3.8-flash": {
    provider: "gemini",
    label: "Gemini 3.8 Flash",
    inputPerMillion: 0.75,
    outputPerMillion: 3.75,
  },
};

export function costUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const info = MODELS[model];
  if (!info) return 0;
  return (
    (inputTokens * info.inputPerMillion + outputTokens * info.outputPerMillion) /
    1_000_000
  );
}
