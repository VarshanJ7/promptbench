// What every provider must return for one model call.
export type CompletionResult = {
  text: string;
  inputTokens: number;
  outputTokens: number; // includes any hidden "thinking" tokens, since those are billed as output
  latencyMs: number;
};

export type ProviderId = "openai" | "anthropic" | "gemini";

// One interface for all providers. A provider throws an Error on failure;
// callers wrap calls in try/catch.
export interface Provider {
  id: ProviderId;
  label: string;
  // Name of the env var holding the API key. Models are hidden when it's unset.
  apiKeyEnv: string;
  complete(model: string, prompt: string): Promise<CompletionResult>;
}

// Shared limits for every provider.
export const REQUEST_TIMEOUT_MS = 120_000;

// Upper bound on output tokens per call (including thinking tokens), so one
// runaway answer can't cost much. Override with MAX_OUTPUT_TOKENS.
export function maxOutputTokens(): number {
  const n = Number(process.env.MAX_OUTPUT_TOKENS);
  return Number.isInteger(n) && n > 0 ? n : 4096;
}

// Reads a JSON error body if there is one, else falls back to the status text.
export async function readJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}
