import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

async function TestSetCount() {
  const count = await prisma.testSet.count();
  return (
    <p className="mt-4">
      Connected to Neon. Test sets in database: {count}
    </p>
  );
}

export default function DbTestPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold">Database test</h1>
      <Suspense fallback={<p className="mt-4">Loading...</p>}>
        <TestSetCount />
      </Suspense>
    </main>
  );
}
