"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MODELS } from "@/lib/providers/pricing";
import { executeRun, type RunSummary } from "@/lib/runner";

export type RunFormState = { error?: string; summary?: RunSummary };

export async function startRun(
  _prev: RunFormState,
  formData: FormData
): Promise<RunFormState> {
  const testSetId = String(formData.get("testSetId") ?? "");
  const promptId = String(formData.get("promptId") ?? "");
  const model = String(formData.get("model") ?? "");

  if (!MODELS[model]) return { error: `Unknown model "${model}".` };

  const [testSet, prompt] = await Promise.all([
    prisma.testSet.findUnique({
      where: { id: testSetId },
      include: { _count: { select: { cases: true } } },
    }),
    prisma.prompt.findUnique({ where: { id: promptId } }),
  ]);
  if (!testSet) return { error: "Please pick a test set." };
  if (!prompt) return { error: "Please pick a prompt." };
  if (testSet._count.cases === 0) {
    return { error: "That test set has no test cases." };
  }

  const run = await prisma.run.create({
    data: { testSetId, promptId, model },
  });

  try {
    const summary = await executeRun(run.id);
    return { summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Run failed: ${message}` };
  } finally {
    revalidatePath("/runs");
  }
}
