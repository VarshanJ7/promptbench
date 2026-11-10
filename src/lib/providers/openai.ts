import "server-only";
import {
  maxOutputTokens,
  readJson,
  REQUEST_TIMEOUT_MS,
  type CompletionResult,
  type Provider,
} from "./types";

const URL = "https://api.openai.com/v1/chat/completions";

type ChatCompletionResponse = {
  choices?: { message?: { content?: string | null } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

export const openaiProvider: Provider = {
  id: "openai",
  label: "OpenAI",
  apiKeyEnv: "OPENAI_API_KEY",

  async complete(model: string, prompt: string): Promise<CompletionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

    const start = performance.now();
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        // Counts reasoning tokens too on GPT-5 models.
        max_completion_tokens: maxOutputTokens(),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - start);

    const data = await readJson<ChatCompletionResponse>(res);
    if (!res.ok) {
      throw new Error(
        `OpenAI ${res.status}: ${data.error?.message ?? res.statusText}`
      );
    }

    return {
      text: data.choices?.[0]?.message?.content ?? "",
      inputTokens: data.usage?.prompt_tokens ?? 0,
      // completion_tokens already includes reasoning tokens.
      outputTokens: data.usage?.completion_tokens ?? 0,
      latencyMs,
    };
  },
};
