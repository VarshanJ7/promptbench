import "server-only";
import { prisma } from "@/lib/prisma";
import { callModel } from "@/lib/providers";

const CONCURRENCY = 5;

// Exact match after trimming whitespace and ignoring case.
export function isCorrect(output: string, expected: string): boolean {
  return output.trim().toLowerCase() === expected.trim().toLowerCase();
}

export function fillTemplate(template: string, input: string): string {
  return template.replaceAll("{{input}}", input);
}

// Runs `fn` over every item with at most `limit` calls in flight at once.
async function forEachWithLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
}

export type RunSummary = {
  runId: string;
  total: number;
  correct: number;
  errors: number;
  accuracy: number;
  avgLatencyMs: number | null;
  totalCostUsd: number;
};

// Executes an already-created Run: calls the model for every test case,
// saves one Result per case, then writes the totals back onto the Run.
export async function executeRun(runId: string): Promise<RunSummary> {
  const run = await prisma.run.findUniqueOrThrow({
    where: { id: runId },
    include: {
      prompt: true,
      testSet: { include: { cases: { orderBy: { createdAt: "asc" } } } },
    },
  });

  await prisma.run.update({
    where: { id: runId },
    data: { status: "running" },
  });

  let correct = 0;
  let errors = 0;
  let totalCostUsd = 0;
  const latencies: number[] = [];

  try {
    await forEachWithLimit(run.testSet.cases, CONCURRENCY, async (tc) => {
      const prompt = fillTemplate(run.prompt.template, tc.input);
      const started = performance.now();

      let data;
      try {
        const res = await callModel(run.model, prompt);
        const ok = isCorrect(res.text, tc.expected);
        if (ok) correct++;
        latencies.push(res.latencyMs);
        totalCostUsd += res.costUsd;
        data = {
          output: res.text,
          correct: ok,
          latencyMs: res.latencyMs,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          costUsd: res.costUsd,
        };
      } catch (err) {
        // One failed call must not stop the run: record it as a wrong answer.
        errors++;
        const message = err instanceof Error ? err.message : String(err);
        data = {
          output: `[error] ${message}`,
          correct: false,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      await prisma.result.create({
        data: { runId, testCaseId: tc.id, ...data },
      });
    });

    const total = run.testSet.cases.length;
    const accuracy = total ? correct / total : 0;
    const avgLatencyMs = latencies.length
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: errors === total && total > 0 ? "failed" : "completed",
        accuracy,
        avgLatencyMs,
        totalCostUsd,
      },
    });

    return {
      runId,
      total,
      correct,
      errors,
      accuracy,
      avgLatencyMs,
      totalCostUsd,
    };
  } catch (err) {
    // Unexpected failure (e.g. database down): don't leave the run "running".
    await prisma.run
      .update({ where: { id: runId }, data: { status: "failed" } })
      .catch(() => {});
    throw err;
  }
}
