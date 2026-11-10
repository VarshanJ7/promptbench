import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { MAX_CASES_PER_RUN, MAX_RUNS_PER_HOUR } from "@/lib/limits";
import { prisma } from "@/lib/prisma";
import { availableModels, missingProviderKeys } from "@/lib/providers";
import { AccuracyBar, StatusBadge } from "@/components/results";
import {
  EmptyIcon,
  EmptyState,
  PageHeader,
  SkeletonForm,
  SkeletonList,
  TableShell,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import RunForm from "./RunForm";

export const metadata: Metadata = { title: "Runs" };

// A run happens inside the Start-run Server Action; give it up to 5 minutes
// on hosts that enforce a function timeout (e.g. Vercel).
export const maxDuration = 300;

async function RunFormLoader() {
  // Read API-key presence per request, not baked in at build time.
  await connection();
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
      models={availableModels().map((m) => ({
        id: m.id,
        label: m.label,
        group: m.provider,
      }))}
      missingKeys={missingProviderKeys()}
      limitsNote={`Limits: up to ${MAX_CASES_PER_RUN()} cases per run, ${MAX_RUNS_PER_HOUR()} runs per hour.`}
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
    return (
      <EmptyState
        icon={<EmptyIcon kind="run" />}
        title="No runs yet."
        description="Start one above; finished runs are listed here."
      />
    );
  }

  return (
    <TableShell minWidth="min-w-[860px]">
      <THead>
        <tr>
          <Th>Test set</Th>
          <Th>Prompt</Th>
          <Th>Model</Th>
          <Th>Status</Th>
          <Th align="right">Results</Th>
          <Th align="right">Exact</Th>
          <Th align="right">Lenient</Th>
          <Th align="right">Avg latency</Th>
          <Th align="right">Cost</Th>
        </tr>
      </THead>
      <tbody>
        {runs.map((r) => {
          const exact =
            r.accuracy != null ? `${(r.accuracy * 100).toFixed(1)}%` : "—";
          const lenient =
            r.lenientAccuracy != null
              ? `${(r.lenientAccuracy * 100).toFixed(1)}%`
              : "—";
          return (
            <Tr key={r.id}>
              <Td className="max-w-[14rem]">
                <Link
                  href={`/results/${r.id}`}
                  className="block truncate font-medium text-accent-text hover:text-fg"
                  title={r.testSet.name}
                >
                  {r.testSet.name}
                </Link>
              </Td>
              <Td className="max-w-[14rem] truncate text-fg-muted" title={r.prompt.name}>
                {r.prompt.name}
              </Td>
              <Td className="whitespace-nowrap font-mono text-xs text-fg-muted">
                {r.model}
              </Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
              <Td numeric className="text-fg-muted">
                {r._count.results}
              </Td>
              <Td numeric>
                <AccuracyBar value={r.accuracy} label={exact} />
              </Td>
              <Td numeric>
                <AccuracyBar value={r.lenientAccuracy} label={lenient} tone="lenient" />
              </Td>
              <Td numeric className="text-fg-muted">
                {r.avgLatencyMs != null ? `${Math.round(r.avgLatencyMs)} ms` : "—"}
              </Td>
              <Td numeric className="text-fg-muted">
                {r.totalCostUsd != null ? `$${r.totalCostUsd.toFixed(5)}` : "—"}
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}

export default function RunsPage() {
  return (
    <main>
      <PageHeader
        title="Runs"
        description="Pick a test set, a prompt and a model, then score every case."
      />
      <Suspense fallback={<SkeletonForm fields={3} />}>
        <RunFormLoader />
      </Suspense>
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-fg">Recent runs</h2>
        <Suspense fallback={<SkeletonList rows={4} rowClassName="h-12" />}>
          <RunList />
        </Suspense>
      </section>
    </main>
  );
}
