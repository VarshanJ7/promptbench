"use server";

import { canWrite, LOCKED_MESSAGE } from "@/lib/auth";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import {
  callModel,
  isModelAvailable,
  type ModelCallResult,
} from "@/lib/providers";

export type PlaygroundState = {
  error?: string;
  result?: ModelCallResult;
};

export async function runPlayground(
  _prev: PlaygroundState,
  formData: FormData
): Promise<PlaygroundState> {
  if (!(await canWrite())) return { error: LOCKED_MESSAGE };

  const model = String(formData.get("model") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) return { error: "Please enter a prompt." };
  if (prompt.length > MAX_PROMPT_CHARS) {
    return { error: `Prompt is too long (max ${MAX_PROMPT_CHARS} characters).` };
  }
  if (!isModelAvailable(model)) {
    return { error: `Model "${model}" is unknown or has no API key set.` };
  }

  try {
    const result = await callModel(model, prompt);
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
