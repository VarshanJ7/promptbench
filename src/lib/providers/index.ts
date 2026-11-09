import "server-only";
import { openaiProvider } from "./openai";
import { MODELS, costUsd } from "./pricing";
import type { CompletionResult, Provider, ProviderId } from "./types";

const PROVIDERS: Record<ProviderId, Provider> = {
  openai: openaiProvider,
};

export type ModelCallResult = CompletionResult & { costUsd: number };

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
