import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fillTemplate } from "@/lib/runner";

function pct(n: number | null) {
  return n != null ? `${(n * 100).toFixed(1)}%` : "—";
}

type FailedResult = {
  id: string;
  output: string;
  testCase: { input: string; expected: string };
};

function FailedList({
  title,
  hint,
  items,
  template,
  tone,
}: {
  title: string;
  hint: string;
  items: FailedResult[];
  template: string;
  tone: "red" | "yellow" | "orange";
}) {
  if (items.length === 0) return null;
  const color = {
    red: "text-red-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
  }[tone];

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold">
        {title} ({items.length})
      </h3>
      <p className="text-sm text-gray-400">{hint}</p>
      <ul className="mt-3 space-y-3">
        {items.map((r) => (
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
              <span className="text-gray-400">Got: </span>
              <span className={`whitespace-pre-wrap font-mono ${color}`}>
                {r.output.replace(/^\[error\]\s*/, "") || "(empty)"}
              </span>
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-500">
                Full prompt sent
              </summary>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-gray-400">
                {fillTemplate(template, r.testCase.input)}
              </pre>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

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

  const apiErrors = failed.filter((r) => r.output.startsWith("[error]"));
  const formatOnly = failed.filter(
    (r) => !r.output.startsWith("[error]") && r.lenientCorrect
  );
  const wrong = failed.filter(
    (r) => !r.output.startsWith("[error]") && !r.lenientCorrect
  );

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
        · {run.status}
      </p>

      <dl className="mt-4 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-gray-400">Exact accuracy</dt>
          <dd className="text-xl">{pct(run.accuracy)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Lenient accuracy</dt>
          <dd className="text-xl">{pct(run.lenientAccuracy)}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Avg latency</dt>
          <dd className="text-xl">
            {run.avgLatencyMs != null
              ? `${Math.round(run.avgLatencyMs)} ms`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Total cost</dt>
          <dd className="text-xl">
            {run.totalCostUsd != null ? `$${run.totalCostUsd.toFixed(5)}` : "—"}
          </dd>
        </div>
      </dl>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-gray-400">
          Prompt template
        </summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-gray-300">
          {run.prompt.template}
        </pre>
      </details>

      <h2 className="mt-8 text-xl font-semibold">
        Failed cases ({failed.length} of {run._count.results}, exact match)
      </h2>

      {failed.length === 0 ? (
        <p className="mt-4 text-green-400">Every case passed.</p>
      ) : (
        <>
          <FailedList
            title="Right label, wrong format"
            hint="The answer contains the correct label but isn't exactly the label, e.g. extra words or punctuation. Passes lenient, fails exact."
            items={formatOnly}
            template={run.prompt.template}
            tone="yellow"
          />
          <FailedList
            title="Wrong answer"
            hint="The correct label is missing, or another label appears too. Fails both scores."
            items={wrong}
            template={run.prompt.template}
            tone="red"
          />
          <FailedList
            title="API errors"
            hint="The model call failed, so there is no answer. Counted as wrong in both scores."
            items={apiErrors}
            template={run.prompt.template}
            tone="orange"
          />
        </>
      )}
    </>
  );
}

export default function RunResultPage({
  params,
}: PageProps<"/results/[runId]">) {
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
