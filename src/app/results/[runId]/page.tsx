import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fillTemplate } from "@/lib/runner";
import { AccuracyBar, StatusBadge } from "@/components/results";
import { Badge, Card, cn, Stat, type BadgeTone } from "@/components/ui";

function pct(n: number | null) {
  return n != null ? `${(n * 100).toFixed(1)}%` : "—";
}

type FailedResult = {
  id: string;
  output: string;
  testCase: { input: string; expected: string };
};

type GroupTone = "format" | "wrong" | "error";

const groupStyle: Record<
  GroupTone,
  { badge: BadgeTone; stripe: string; output: string; outputBg: string }
> = {
  format: {
    badge: "warning",
    stripe: "before:bg-amber-400",
    output: "text-red-300",
    outputBg: "bg-red-400/[0.07] border-red-400/20",
  },
  wrong: {
    badge: "danger",
    stripe: "before:bg-red-400",
    output: "text-red-300",
    outputBg: "bg-red-400/[0.07] border-red-400/20",
  },
  error: {
    badge: "error",
    stripe: "before:bg-orange-400",
    output: "text-orange-300",
    outputBg: "bg-orange-400/[0.07] border-orange-400/20",
  },
};

function Chevron() {
  return (
    <svg
      className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-90"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  tone: GroupTone;
}) {
  if (items.length === 0) return null;
  const s = groupStyle[tone];

  return (
    <section className="mt-8 first:mt-0">
      <header className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        <Badge tone={s.badge} dot>
          {items.length}
        </Badge>
        <p className="w-full text-sm text-fg-muted">{hint}</p>
      </header>
      <ul className="space-y-2.5">
        {items.map((r) => (
          <li
            key={r.id}
            className={cn(
              "relative overflow-hidden rounded-lg border border-line bg-surface shadow-sm shadow-black/20",
              "before:absolute before:inset-y-0 before:left-0 before:w-0.5",
              s.stripe
            )}
          >
            <dl className="grid gap-x-4 gap-y-2.5 px-4 py-3.5 sm:grid-cols-[6rem_1fr] sm:pl-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle sm:pt-0.5">
                Input
              </dt>
              <dd className="text-sm leading-relaxed text-fg">
                {r.testCase.input}
              </dd>

              <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle sm:pt-1">
                Expected
              </dt>
              <dd>
                <span className="inline-block rounded border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-0.5 font-mono text-xs text-emerald-300">
                  {r.testCase.expected}
                </span>
              </dd>

              <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle sm:pt-1">
                Got
              </dt>
              <dd>
                <span
                  className={cn(
                    "inline-block max-w-full whitespace-pre-wrap break-words rounded border px-2 py-0.5 font-mono text-xs",
                    s.output,
                    s.outputBg
                  )}
                >
                  {r.output.replace(/^\[error\]\s*/, "") || "(empty)"}
                </span>
              </dd>
            </dl>
            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2 text-xs font-medium text-fg-subtle hover:text-fg-muted sm:pl-5 [&::-webkit-details-marker]:hidden">
                <Chevron />
                Full prompt sent
              </summary>
              <pre className="mx-4 mb-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas p-3 font-mono text-xs leading-relaxed text-fg-muted sm:ml-5">
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
      <div className="mb-6 sm:mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-fg-subtle">
          <span>
            Test set:{" "}
            <Link
              href={`/results?testSet=${run.testSet.id}`}
              className="font-medium text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-fg-subtle"
            >
              {run.testSet.name}
            </Link>
          </span>
          <span aria-hidden="true">·</span>
          <StatusBadge status={run.status} />
        </div>
        <h1 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight text-fg">
          <span>{run.prompt.name}</span>
          <span className="text-fg-subtle">·</span>
          <span className="font-mono text-lg font-medium text-fg-muted">
            {run.model}
          </span>
        </h1>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Exact accuracy"
          value={pct(run.accuracy)}
          footer={<AccuracyBar value={run.accuracy} label="" size="lg" />}
        />
        <Stat
          label="Lenient accuracy"
          value={pct(run.lenientAccuracy)}
          footer={
            <AccuracyBar
              value={run.lenientAccuracy}
              label=""
              size="lg"
              tone="lenient"
            />
          }
        />
        <Stat
          label="Avg latency"
          value={
            run.avgLatencyMs != null
              ? `${Math.round(run.avgLatencyMs)} ms`
              : "—"
          }
        />
        <Stat
          label="Total cost"
          value={
            run.totalCostUsd != null ? `$${run.totalCostUsd.toFixed(5)}` : "—"
          }
        />
      </dl>

      <Card className="mt-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
            <Chevron />
            Prompt template
          </summary>
          <pre className="mx-4 mb-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas p-3 font-mono text-xs leading-relaxed text-fg-muted">
            {run.prompt.template}
          </pre>
        </details>
      </Card>

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-fg">
          Failed cases{" "}
          <span className="font-normal text-fg-subtle">
            ({failed.length} of {run._count.results}, exact match)
          </span>
        </h2>

        {failed.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300">
            <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Every case passed.
          </div>
        ) : (
          <>
            <FailedList
              title="Right label, wrong format"
              hint="The answer contains the correct label but isn't exactly the label, e.g. extra words or punctuation. Passes lenient, fails exact."
              items={formatOnly}
              template={run.prompt.template}
              tone="format"
            />
            <FailedList
              title="Wrong answer"
              hint="The correct label is missing, or another label appears too. Fails both scores."
              items={wrong}
              template={run.prompt.template}
              tone="wrong"
            />
            <FailedList
              title="API errors"
              hint="The model call failed, so there is no answer. Counted as wrong in both scores."
              items={apiErrors}
              template={run.prompt.template}
              tone="error"
            />
          </>
        )}
      </div>
    </>
  );
}

function RunDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading run">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-48 animate-pulse rounded bg-surface-raised" />
        <div className="h-7 w-80 max-w-full animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function RunResultPage({
  params,
}: PageProps<"/results/[runId]">) {
  return (
    <main>
      <Link
        href="/results"
        className="mb-5 inline-flex items-center gap-1.5 rounded text-sm text-fg-subtle hover:text-fg"
      >
        <span aria-hidden="true">←</span> All results
      </Link>
      <div>
        <Suspense fallback={<RunDetailSkeleton />}>
          <RunDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}
