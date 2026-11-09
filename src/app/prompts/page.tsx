import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PromptForm from "./PromptForm";

async function PromptList() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });

  if (prompts.length === 0) {
    return <p className="mt-4 text-gray-400">No prompts yet.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {prompts.map((p) => (
        <li key={p.id} className="rounded border border-gray-700 px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium">{p.name}</span>
            <span className="text-sm text-gray-400">
              {p._count.runs} runs · {p.createdAt.toLocaleDateString()}
            </span>
          </div>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-gray-300">
            {p.template}
          </pre>
        </li>
      ))}
    </ul>
  );
}

export default function PromptsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Prompts</h1>
      <PromptForm />
      <h2 className="mt-10 text-xl font-semibold">Saved prompts</h2>
      <Suspense fallback={<p className="mt-4">Loading...</p>}>
        <PromptList />
      </Suspense>
    </main>
  );
}
