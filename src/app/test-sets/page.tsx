import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import UploadForm from "./UploadForm";

async function TestSetList() {
  const testSets = await prisma.testSet.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } } },
  });

  if (testSets.length === 0) {
    return <p className="mt-4 text-gray-400">No test sets yet.</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {testSets.map((ts) => (
        <li key={ts.id} className="rounded border border-gray-700 px-4 py-2">
          {ts.name}{" "}
          <span className="text-gray-400">({ts._count.cases} cases)</span>
        </li>
      ))}
    </ul>
  );
}

export default function TestSetsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Test sets</h1>
      <UploadForm />
      <h2 className="mt-10 text-xl font-semibold">Saved test sets</h2>
      <Suspense fallback={<p className="mt-4">Loading...</p>}>
        <TestSetList />
      </Suspense>
    </main>
  );
}
