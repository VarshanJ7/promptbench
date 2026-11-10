import "server-only";
import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";
import { MODELS, costUsd } from "./pricing";
import type { CompletionResult, Provider, ProviderId } from "./types";

const PROVIDERS: Record<ProviderId, Provider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

export type ModelCallResult = CompletionResult & { costUsd: number };

export type ModelOption = { id: string; label: string; provider: string };

function hasKey(provider: ProviderId): boolean {
  return Boolean(process.env[PROVIDERS[provider].apiKeyEnv]);
}

// True if the model is in the pricing table and its provider's key is set.
export function isModelAvailable(model: string): boolean {
  const info = MODELS[model];
  return Boolean(info && hasKey(info.provider));
}

// Models for the dropdowns. Providers without an API key are left out, so the
// UI never offers a model that would fail on every call.
export function availableModels(): ModelOption[] {
  return Object.entries(MODELS)
    .filter(([, m]) => hasKey(m.provider))
    .map(([id, m]) => ({
      id,
      label: `${m.label} (${id})`,
      provider: PROVIDERS[m.provider].label,
    }));
}

// Providers whose key is missing, for a hint in the UI. Names only, never values.
export function missingProviderKeys(): { provider: string; env: string }[] {
  return Object.values(PROVIDERS)
    .filter((p) => !hasKey(p.id))
    .map((p) => ({ provider: p.label, env: p.apiKeyEnv }));
}

// The one function the rest of the app calls. It picks the provider from the
// model name, makes the call, and adds the cost. It throws on failure, so
// callers must use try/catch.
export async function callModel(
  model: string,
  prompt: string
): Promise<ModelCallResult> {
  const info = MODELS[model];
  if (!info) throw new Error(`Unknown model "${model}".`);

  const result = await PROVIDERS[info.provider].complete(model, prompt);
  return {
    ...result,
    costUsd: costUsd(model, result.inputTokens, result.outputTokens),
  };
}

export { MODELS } from "./pricing";
export type { CompletionResult } from "./types";
