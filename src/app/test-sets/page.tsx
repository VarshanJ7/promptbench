import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  EmptyIcon,
  EmptyState,
  PageHeader,
  SkeletonList,
} from "@/components/ui";
import UploadForm from "./UploadForm";

export const metadata: Metadata = { title: "Test sets" };

async function TestSetList() {
  const testSets = await prisma.testSet.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } } },
  });

  if (testSets.length === 0) {
    return (
      <EmptyState
        icon={<EmptyIcon kind="file" />}
        title="No test sets yet."
        description="Upload a CSV with the form to create your first one."
      />
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface shadow-sm shadow-black/20">
      {testSets.map((ts) => (
        <li
          key={ts.id}
          className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-raised/60"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-raised text-fg-subtle">
              <EmptyIcon kind="file" />
            </span>
            <span className="truncate font-medium text-fg">{ts.name}</span>
          </div>
          <Badge tone="neutral" className="tabular-nums">
            ({ts._count.cases} cases)
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export default function TestSetsPage() {
  return (
    <main>
      <PageHeader
        title="Test sets"
        description="Labelled examples to evaluate prompts against."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <UploadForm />
        <section>
          <h2 className="mb-3 text-sm font-semibold text-fg">Saved test sets</h2>
          <Suspense fallback={<SkeletonList rows={3} rowClassName="h-14" />}>
            <TestSetList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
