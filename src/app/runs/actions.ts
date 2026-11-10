"use server";

import { revalidatePath } from "next/cache";
import { canWrite, LOCKED_MESSAGE } from "@/lib/auth";
import { MAX_CASES_PER_RUN, runQuotaError } from "@/lib/limits";
import { prisma } from "@/lib/prisma";
import { isModelAvailable } from "@/lib/providers";
import { MODELS } from "@/lib/providers/pricing";
import { executeRun, type RunSummary } from "@/lib/runner";

export type RunFormState = { error?: string; summary?: RunSummary };

export async function startRun(
  _prev: RunFormState,
  formData: FormData
): Promise<RunFormState> {
  // Re-check auth here: Server Actions are public endpoints, so a hidden
  // button is not protection on its own.
  if (!(await canWrite())) return { error: LOCKED_MESSAGE };

  const testSetId = String(formData.get("testSetId") ?? "");
  const promptId = String(formData.get("promptId") ?? "");
  const model = String(formData.get("model") ?? "");

  if (!MODELS[model]) return { error: `Unknown model "${model}".` };
  if (!isModelAvailable(model)) {
    return { error: `No API key is set for ${MODELS[model].label}.` };
  }

  const [testSet, prompt] = await Promise.all([
    prisma.testSet.findUnique({
      where: { id: testSetId },
      include: { _count: { select: { cases: true } } },
    }),
    prisma.prompt.findUnique({ where: { id: promptId } }),
  ]);
  if (!testSet) return { error: "Please pick a test set." };
  if (!prompt) return { error: "Please pick a prompt." };

  const caseCount = testSet._count.cases;
  if (caseCount === 0) return { error: "That test set has no test cases." };
  const maxCases = MAX_CASES_PER_RUN();
  if (caseCount > maxCases) {
    return {
      error: `That test set has ${caseCount} cases; the limit per run is ${maxCases}. Upload a smaller set.`,
    };
  }

  const quotaError = await runQuotaError();
  if (quotaError) return { error: quotaError };

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
    revalidatePath("/results");
  }
}
