import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { availableModels, missingProviderKeys } from "@/lib/providers";
import { Alert, PageHeader, Skeleton, SkeletonForm } from "@/components/ui";
import PlaygroundForm from "./PlaygroundForm";

export const metadata: Metadata = { title: "Playground" };

async function PlaygroundLoader() {
  // Read API-key presence per request, not baked in at build time.
  await connection();
  const models = availableModels();
  const missing = missingProviderKeys();

  const hiddenNote =
    missing.length > 0 ? (
      <p className="text-xs text-fg-subtle">
        Hidden (no API key):{" "}
        {missing.map((k) => `${k.provider} (${k.env})`).join(", ")}
      </p>
    ) : null;

  return models.length > 0 ? (
    <PlaygroundForm models={models} footer={hiddenNote} />
  ) : (
    <div className="space-y-3">
      <Alert tone="warning">No model provider is configured.</Alert>
      {hiddenNote}
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <SkeletonForm fields={2} />
      <Skeleton className="hidden h-[22rem] rounded-lg lg:block" />
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <main>
      <PageHeader
        title="Playground"
        description="Send one prompt to one model to check a provider."
      />
      <Suspense fallback={<PlaygroundSkeleton />}>
        <PlaygroundLoader />
      </Suspense>
    </main>
  );
}
