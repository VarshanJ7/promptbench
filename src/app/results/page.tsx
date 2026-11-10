import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  AccuracyBar,
  BestBadge,
  FormatBadge,
  StatusBadge,
} from "@/components/results";
import {
  buttonClasses,
  Card,
  cn,
  PageHeader,
  TableShell,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";

export const metadata: Metadata = { title: "Results" };

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
      <Card className="flex flex-col items-center border-dashed px-6 py-14 text-center">
        <p className="text-sm font-medium text-fg">No runs yet.</p>
        <p className="mt-1 text-sm text-fg-muted">
          Results appear here once a run finishes.
        </p>
        <Link href="/runs" className={cn(buttonClasses("primary"), "mt-5")}>
          Start one
        </Link>
      </Card>
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

  // Best exact accuracy first, then lenient; on a tie, cheaper first.
  runs.sort(
    (a, b) =>
      (b.accuracy ?? -1) - (a.accuracy ?? -1) ||
      (b.lenientAccuracy ?? -1) - (a.lenientAccuracy ?? -1) ||
      (a.totalCostUsd ?? Infinity) - (b.totalCostUsd ?? Infinity)
  );
  const bestId = runs.find((r) => r.status === "completed")?.id;

  return (
    <>
      {/* Test-set switcher */}
      <nav aria-label="Test set" className="mb-4 flex flex-wrap gap-1.5">
        {testSets.map((t) => {
          const active = t.id === selected.id;
          return (
            <Link
              key={t.id}
              href={`/results?testSet=${t.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "border-accent-text/40 bg-accent-soft text-fg"
                  : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg"
              )}
            >
              {t.name}
            </Link>
          );
        })}
      </nav>

      <TableShell minWidth="min-w-[920px]">
        <THead>
          <tr>
            <Th>Prompt</Th>
            <Th>Model</Th>
            <Th align="right" title="Output equals the label exactly">
              Exact
            </Th>
            <Th
              align="right"
              title="Output contains the right label and no other label"
            >
              Lenient
            </Th>
            <Th align="right">Failed (exact)</Th>
            <Th align="right">Avg latency</Th>
            <Th align="right">Total cost</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th>
              <span className="sr-only">Details</span>
            </Th>
          </tr>
        </THead>
        <tbody>
          {runs.map((r) => {
            const isBest = r.id === bestId;
            const failedCount = failedByRun.get(r.id) ?? 0;
            return (
              <Tr
                key={r.id}
                className={cn(
                  isBest &&
                    "bg-accent-soft/40 shadow-[inset_2px_0_0_0_var(--color-accent-text)] hover:bg-accent-soft/60"
                )}
              >
                <Td className="max-w-[16rem]">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-fg" title={r.prompt.name}>
                      {r.prompt.name}
                    </span>
                    {isBest && <BestBadge />}
                  </div>
                </Td>
                <Td className="whitespace-nowrap font-mono text-xs text-fg-muted">
                  {r.model}
                </Td>
                <Td numeric>
                  <AccuracyBar value={r.accuracy} label={pct(r.accuracy)} />
                </Td>
                <Td numeric>
                  <div className="flex flex-col items-end gap-1">
                    <AccuracyBar
                      value={r.lenientAccuracy}
                      label={pct(r.lenientAccuracy)}
                      tone="lenient"
                    />
                    {r.accuracy != null &&
                      r.lenientAccuracy != null &&
                      r.lenientAccuracy > r.accuracy && (
                        <FormatBadge
                          points={(
                            (r.lenientAccuracy - r.accuracy) *
                            100
                          ).toFixed(0)}
                        />
                      )}
                  </div>
                </Td>
                <Td numeric>
                  <span className={failedCount > 0 ? "text-fg" : "text-fg-subtle"}>
                    {failedCount}
                  </span>
                  <span className="text-fg-subtle">/{r._count.results}</span>
                </Td>
                <Td numeric className="text-fg-muted">
                  {r.avgLatencyMs != null
                    ? `${Math.round(r.avgLatencyMs)} ms`
                    : "—"}
                </Td>
                <Td numeric className="text-fg-muted">
                  {r.totalCostUsd != null
                    ? `$${r.totalCostUsd.toFixed(5)}`
                    : "—"}
                </Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td className="whitespace-nowrap text-xs text-fg-subtle tabular-nums">
                  {r.createdAt.toLocaleString()}
                </Td>
                <Td align="right">
                  <Link
                    href={`/results/${r.id}`}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded text-sm font-medium text-accent-text hover:text-fg"
                  >
                    Failed cases
                    <span aria-hidden="true">→</span>
                  </Link>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </TableShell>
      <p className="mt-2 text-xs text-fg-subtle sm:hidden">
        Scroll the table sideways to see every column.
      </p>
    </>
  );
}

function ComparisonSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading results">
      <div className="mb-4 flex gap-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="h-8 w-28 animate-pulse rounded-md bg-surface-raised" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="h-10 border-b border-line bg-canvas/40" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0">
            <div className="h-3 w-32 animate-pulse rounded bg-surface-raised" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-raised" />
            <div className="ml-auto h-3 w-40 animate-pulse rounded bg-surface-raised" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function ResultsPage({ searchParams }: PageProps<"/results">) {
  return (
    <main>
      <PageHeader
        title="Results"
        description={
          <>
            Every run on one test set, side by side, best exact accuracy first.{" "}
            <strong className="font-medium text-fg">Exact</strong> = the output
            is exactly the label.{" "}
            <strong className="font-medium text-fg">Lenient</strong> = the
            output contains the right label and no other label, so a gap
            between them means &quot;right answer, wrong format&quot;.
          </>
        }
      />
      <Suspense fallback={<ComparisonSkeleton />}>
        <Comparison searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
