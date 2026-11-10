"use server";

import { revalidatePath } from "next/cache";
import { canWrite, LOCKED_MESSAGE } from "@/lib/auth";
import { MAX_PROMPT_CHARS } from "@/lib/limits";
import { prisma } from "@/lib/prisma";

export type PromptFormState = { error?: string; success?: string };

const PLACEHOLDER = "{{input}}";

export async function createPrompt(
  _prev: PromptFormState,
  formData: FormData
): Promise<PromptFormState> {
  if (!(await canWrite())) return { error: LOCKED_MESSAGE };

  const name = String(formData.get("name") ?? "").trim();
  const template = String(formData.get("template") ?? "").trim();

  if (!name) return { error: "Please enter a name for the prompt." };
  if (!template) return { error: "Please enter a prompt template." };
  if (template.length > MAX_PROMPT_CHARS) {
    return {
      error: `Template is too long (max ${MAX_PROMPT_CHARS} characters).`,
    };
  }
  if (!template.includes(PLACEHOLDER)) {
    return {
      error: `The template must contain ${PLACEHOLDER} — that's where each test case's input gets inserted.`,
    };
  }

  await prisma.prompt.create({ data: { name, template } });

  revalidatePath("/prompts");
  return { success: `Saved prompt "${name}".` };
}
