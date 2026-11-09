import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function pct(n: number | null) {
  return n != null ? `${(n * 100).toFixed(1)}%` : "—";
}

async function Comparison({
  searchParams,
}: {
  searchParams: Promise<{ testSet?: string | string[] }>;
}) {
  const { testSet: raw } = await searchParams;
  const requested = Array.isArray(raw) ? raw[0] : raw;

  // Only test sets that have at least one run are worth comparing.
  const testSets = await prisma.testSet.findMany({
    where: { runs: { some: {} } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  if (testSets.length === 0) {
    return (
      <p className="mt-6 text-gray-400">
        No runs yet.{" "}
        <Link href="/runs" className="underline">
          Start one
        </Link>
        .
      </p>
    );
  }

  const selected = testSets.find((t) => t.id === requested) ?? testSets[0];

  const runs = await prisma.run.findMany({
    where: { testSetId: selected.id },
    include: {
      prompt: { select: { name: true } },
      _count: { select: { results: true } },
    },
  });
  // "Failed" = wrong answers + API errors (both stored with correct = false).
  const failedCounts = await prisma.result.groupBy({
    by: ["runId"],
    where: { runId: { in: runs.map((r) => r.id) }, correct: false },
    _count: { _all: true },
  });
  const failedByRun = new Map(
    failedCounts.map((f) => [f.runId, f._count._all])
  );

  // Best accuracy first; on a tie, cheaper first.
  runs.sort(
    (a, b) =>
      (b.accuracy ?? -1) - (a.accuracy ?? -1) ||
      (a.totalCostUsd ?? Infinity) - (b.totalCostUsd ?? Infinity)
  );
  const bestId = runs.find((r) => r.status === "completed")?.id;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {testSets.map((t) => (
          <Link
            key={t.id}
            href={`/results?testSet=${t.id}`}
            className={`rounded border px-3 py-1 text-sm ${
              t.id === selected.id
                ? "border-white bg-white text-black"
                : "border-gray-600"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead className="text-gray-400">
          <tr>
            <th className="py-2 pr-4">Prompt</th>
            <th className="py-2 pr-4">Model</th>
            <th className="py-2 pr-4">Accuracy</th>
            <th className="py-2 pr-4">Failed</th>
            <th className="py-2 pr-4">Avg latency</th>
            <th className="py-2 pr-4">Total cost</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr
              key={r.id}
              className={`border-t border-gray-800 ${
                r.id === bestId ? "bg-green-950/40" : ""
              }`}
            >
              <td className="py-2 pr-4">
                {r.prompt.name}
                {r.id === bestId && (
                  <span className="ml-2 text-xs text-green-400">best</span>
                )}
              </td>
              <td className="py-2 pr-4 font-mono">{r.model}</td>
              <td className="py-2 pr-4">{pct(r.accuracy)}</td>
              <td className="py-2 pr-4">
                {failedByRun.get(r.id) ?? 0}/{r._count.results}
              </td>
              <td className="py-2 pr-4">
                {r.avgLatencyMs != null
                  ? `${Math.round(r.avgLatencyMs)} ms`
                  : "—"}
              </td>
              <td className="py-2 pr-4">
                {r.totalCostUsd != null ? `$${r.totalCostUsd.toFixed(5)}` : "—"}
              </td>
              <td className="py-2 pr-4">{r.status}</td>
              <td className="py-2 pr-4 text-gray-400">
                {r.createdAt.toLocaleString()}
              </td>
              <td className="py-2 pr-4">
                <Link href={`/results/${r.id}`} className="underline">
                  Failed cases
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function ResultsPage({ searchParams }: PageProps<"/results">) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Results</h1>
      <p className="mt-2 text-gray-400">
        Every run on one test set, side by side. Best accuracy first.
      </p>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <Comparison searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
