import "server-only";
import {
  maxOutputTokens,
  readJson,
  REQUEST_TIMEOUT_MS,
  type CompletionResult,
  type Provider,
} from "./types";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GenerateContentResponse = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
  error?: { message?: string };
};

export const geminiProvider: Provider = {
  id: "gemini",
  label: "Google Gemini",
  apiKeyEnv: "GEMINI_API_KEY",

  async complete(model: string, prompt: string): Promise<CompletionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

    const start = performance.now();
    const res = await fetch(
      `${BASE}/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxOutputTokens() },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    const latencyMs = Math.round(performance.now() - start);

    const data = await readJson<GenerateContentResponse>(res);
    if (!res.ok) {
      throw new Error(
        `Gemini ${res.status}: ${data.error?.message ?? res.statusText}`
      );
    }
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
    }

    // Skip "thought" parts; keep only the visible answer text.
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("");

    const u = data.usageMetadata ?? {};
    return {
      text,
      inputTokens: u.promptTokenCount ?? 0,
      // Thinking tokens are billed at the output rate, so count them as output.
      outputTokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0),
      latencyMs,
    };
  },
};
