import "server-only";
import {
  maxOutputTokens,
  readJson,
  REQUEST_TIMEOUT_MS,
  type CompletionResult,
  type Provider,
} from "./types";

const URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2026-10-21";

type MessagesResponse = {
  content?: { type: string; text?: string }[];
  stop_reason?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { type?: string; message?: string };
};

// Note: no server-side model fallback is enabled on purpose. A benchmark must
// measure the model it names; a silent fallback would score a different one.
export const anthropicProvider: Provider = {
  id: "anthropic",
  label: "Anthropic",
  apiKeyEnv: "ANTHROPIC_API_KEY",

  async complete(model: string, prompt: string): Promise<CompletionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

    const start = performance.now();
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": API_VERSION,
      },
      body: JSON.stringify({
        model,
        // Includes thinking tokens on current models, which think by default.
        max_tokens: maxOutputTokens(),
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - start);

    const data = await readJson<MessagesResponse>(res);
    if (!res.ok) {
      throw new Error(
        `Anthropic ${res.status}: ${data.error?.message ?? res.statusText}`
      );
    }
    if (data.stop_reason === "refusal") {
      throw new Error("Anthropic: the model declined this request (refusal).");
    }

    // Content is a list of blocks (thinking, text, ...); keep only the text.
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");

    return {
      text,
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      latencyMs,
    };
  },
};
