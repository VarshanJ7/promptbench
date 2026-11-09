"use server";

import { callModel, type ModelCallResult } from "@/lib/providers";

export type PlaygroundState = {
  error?: string;
  result?: ModelCallResult;
};

export async function runPlayground(
  _prev: PlaygroundState,
  formData: FormData
): Promise<PlaygroundState> {
  const model = String(formData.get("model") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) return { error: "Please enter a prompt." };

  try {
    const result = await callModel(model, prompt);
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
