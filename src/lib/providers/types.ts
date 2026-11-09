// What every provider must return for one model call.
export type CompletionResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

// One interface for all providers (OpenAI now; Anthropic and Gemini later).
// A provider throws an Error on failure; callers wrap calls in try/catch.
export interface Provider {
  id: ProviderId;
  complete(model: string, prompt: string): Promise<CompletionResult>;
}

export type ProviderId = "openai";
