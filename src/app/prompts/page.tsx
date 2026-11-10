import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PromptTemplate } from "@/components/PromptTemplate";
import {
  EmptyIcon,
  EmptyState,
  PageHeader,
  SkeletonList,
} from "@/components/ui";
import PromptForm from "./PromptForm";

export const metadata: Metadata = { title: "Prompts" };

async function PromptList() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });

  if (prompts.length === 0) {
    return (
      <EmptyState
        icon={<EmptyIcon kind="prompt" />}
        title="No prompts yet."
        description="Write a template with an {{input}} slot using the form."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {prompts.map((p) => (
        <li
          key={p.id}
          className="rounded-lg border border-line bg-surface p-4 shadow-sm shadow-black/20"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-medium text-fg">{p.name}</span>
            <span className="text-xs tabular-nums text-fg-subtle">
              {p._count.runs} runs · {p.createdAt.toLocaleDateString()}
            </span>
          </div>
          <PromptTemplate template={p.template} className="mt-3" />
        </li>
      ))}
    </ul>
  );
}

export default function PromptsPage() {
  return (
    <main>
      <PageHeader
        title="Prompts"
        description="Templates you can run against any test set and model."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <PromptForm />
        </div>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-fg">Saved prompts</h2>
          <Suspense fallback={<SkeletonList rows={3} rowClassName="h-32" />}>
            <PromptList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
