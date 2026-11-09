import type { ProviderId } from "./types";

export type ModelInfo = {
  provider: ProviderId;
  label: string;
  inputPerMillion: number; // USD per 1M input tokens
  outputPerMillion: number; // USD per 1M output tokens
};

// Standard (non-batch) prices. Check them against the provider's pricing page
// from time to time. Cached-input discounts are ignored, so costs for long
// repeated prompts may come out slightly high.
export const MODELS: Record<string, ModelInfo> = {
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
