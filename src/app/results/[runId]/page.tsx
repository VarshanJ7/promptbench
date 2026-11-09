import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fillTemplate } from "@/lib/runner";

async function RunDetail({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: {
      testSet: { select: { id: true, name: true } },
      prompt: true,
      _count: { select: { results: true } },
    },
  });
  if (!run) notFound();

  const failed = await prisma.result.findMany({
    where: { runId, correct: false },
    include: { testCase: true },
    orderBy: { testCase: { createdAt: "asc" } },
  });

  return (
    <>
      <h1 className="text-2xl font-bold">
        {run.prompt.name} · <span className="font-mono">{run.model}</span>
      </h1>
      <p className="mt-2 text-gray-400">
        Test set:{" "}
        <Link href={`/results?testSet=${run.testSet.id}`} className="underline">
          {run.testSet.name}
        </Link>{" "}
        · {run.status} · accuracy{" "}
        {run.accuracy != null ? `${(run.accuracy * 100).toFixed(1)}%` : "—"} ·
        avg{" "}
        {run.avgLatencyMs != null ? `${Math.round(run.avgLatencyMs)} ms` : "—"}{" "}
        · {run.totalCostUsd != null ? `$${run.totalCostUsd.toFixed(5)}` : "—"}
      </p>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-gray-400">Prompt template</summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-gray-300">
          {run.prompt.template}
        </pre>
      </details>

      <h2 className="mt-8 text-xl font-semibold">
        Failed cases ({failed.length} of {run._count.results})
      </h2>

      {failed.length === 0 ? (
        <p className="mt-4 text-green-400">Every case passed.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {failed.map((r) => {
            const isError = r.output.startsWith("[error]");
            return (
              <li
                key={r.id}
                className="rounded border border-gray-700 px-4 py-3 text-sm"
              >
                <p>
                  <span className="text-gray-400">Input: </span>
                  {r.testCase.input}
                </p>
                <p className="mt-1">
                  <span className="text-gray-400">Expected: </span>
                  <span className="font-mono text-green-400">
                    {r.testCase.expected}
                  </span>
                </p>
                <p className="mt-1">
                  <span className="text-gray-400">
                    {isError ? "API error: " : "Got: "}
                  </span>
                  <span
                    className={`whitespace-pre-wrap font-mono ${
                      isError ? "text-yellow-400" : "text-red-400"
                    }`}
                  >
                    {isError
                      ? r.output.replace(/^\[error\]\s*/, "")
                      : r.output || "(empty)"}
                  </span>
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-500">
                    Full prompt sent
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-gray-400">
                    {fillTemplate(run.prompt.template, r.testCase.input)}
                  </pre>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function RunResultPage({ params }: PageProps<"/results/[runId]">) {
  return (
    <main className="p-8">
      <Link href="/results" className="text-sm text-gray-400 underline">
        ← All results
      </Link>
      <div className="mt-4">
        <Suspense fallback={<p>Loading...</p>}>
          <RunDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}
