import "server-only";
import { prisma } from "@/lib/prisma";
import { callModel } from "@/lib/providers";
import { distinctLabels, isExactMatch, isLenientMatch } from "@/lib/scoring";

const CONCURRENCY = 5;

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
  lenientCorrect: number;
  errors: number;
  accuracy: number;
  lenientAccuracy: number;
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

  const cases = run.testSet.cases;
  const labels = distinctLabels(cases.map((c) => c.expected));

  let correct = 0;
  let lenientCorrect = 0;
  let errors = 0;
  let totalCostUsd = 0;
  const latencies: number[] = [];

  try {
    await forEachWithLimit(cases, CONCURRENCY, async (tc) => {
      const prompt = fillTemplate(run.prompt.template, tc.input);
      const started = performance.now();

      let data;
      try {
        const res = await callModel(run.model, prompt);
        const exact = isExactMatch(res.text, tc.expected);
        const lenient = isLenientMatch(res.text, tc.expected, labels);
        if (exact) correct++;
        if (lenient) lenientCorrect++;
        latencies.push(res.latencyMs);
        totalCostUsd += res.costUsd;
        data = {
          output: res.text,
          correct: exact,
          lenientCorrect: lenient,
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
          lenientCorrect: false,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      await prisma.result.create({
        data: { runId, testCaseId: tc.id, ...data },
      });
    });

    const total = cases.length;
    const accuracy = total ? correct / total : 0;
    const lenientAccuracy = total ? lenientCorrect / total : 0;
    const avgLatencyMs = latencies.length
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: errors === total && total > 0 ? "failed" : "completed",
        accuracy,
        lenientAccuracy,
        avgLatencyMs,
        totalCostUsd,
      },
    });

    return {
      runId,
      total,
      correct,
      lenientCorrect,
      errors,
      accuracy,
      lenientAccuracy,
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
