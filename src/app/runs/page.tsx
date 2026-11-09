import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MODELS } from "@/lib/providers/pricing";
import RunForm from "./RunForm";

async function RunFormLoader() {
  const [testSets, prompts] = await Promise.all([
    prisma.testSet.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cases: true } } },
    }),
    prisma.prompt.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <RunForm
      testSets={testSets.map((t) => ({
        id: t.id,
        label: `${t.name} (${t._count.cases} cases)`,
      }))}
      prompts={prompts.map((p) => ({ id: p.id, label: p.name }))}
      models={Object.entries(MODELS).map(([id, m]) => ({
        id,
        label: `${m.label} (${id})`,
      }))}
    />
  );
}

async function RunList() {
  const runs = await prisma.run.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      testSet: { select: { name: true } },
      prompt: { select: { name: true } },
      _count: { select: { results: true } },
    },
  });

  if (runs.length === 0) {
    return <p className="mt-4 text-gray-400">No runs yet.</p>;
  }

  return (
    <table className="mt-4 w-full text-left text-sm">
      <thead className="text-gray-400">
        <tr>
          <th className="py-2 pr-4">Test set</th>
          <th className="py-2 pr-4">Prompt</th>
          <th className="py-2 pr-4">Model</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-4">Results</th>
          <th className="py-2 pr-4">Accuracy</th>
          <th className="py-2 pr-4">Avg latency</th>
          <th className="py-2 pr-4">Cost</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id} className="border-t border-gray-800">
            <td className="py-2 pr-4">
              <Link href={`/results/${r.id}`} className="underline">
                {r.testSet.name}
              </Link>
            </td>
            <td className="py-2 pr-4">{r.prompt.name}</td>
            <td className="py-2 pr-4 font-mono">{r.model}</td>
            <td className="py-2 pr-4">{r.status}</td>
            <td className="py-2 pr-4">{r._count.results}</td>
            <td className="py-2 pr-4">
              {r.accuracy != null ? `${(r.accuracy * 100).toFixed(1)}%` : "—"}
            </td>
            <td className="py-2 pr-4">
              {r.avgLatencyMs != null ? `${Math.round(r.avgLatencyMs)} ms` : "—"}
            </td>
            <td className="py-2 pr-4">
              {r.totalCostUsd != null ? `$${r.totalCostUsd.toFixed(5)}` : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function RunsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Runs</h1>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <RunFormLoader />
      </Suspense>
      <h2 className="mt-10 text-xl font-semibold">Recent runs</h2>
      <Suspense fallback={<p className="mt-4">Loading...</p>}>
        <RunList />
      </Suspense>
    </main>
  );
}
