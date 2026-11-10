import { Suspense } from "react";
import { connection } from "next/server";
import { availableModels, missingProviderKeys } from "@/lib/providers";
import PlaygroundForm from "./PlaygroundForm";

async function PlaygroundLoader() {
  // Read API-key presence per request, not baked in at build time.
  await connection();
  const models = availableModels();
  const missing = missingProviderKeys();

  return (
    <>
      {models.length > 0 ? (
        <PlaygroundForm models={models} />
      ) : (
        <p className="mt-6 text-gray-400">No model provider is configured.</p>
      )}
      {missing.length > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Hidden (no API key):{" "}
          {missing.map((k) => `${k.provider} (${k.env})`).join(", ")}
        </p>
      )}
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Playground</h1>
      <p className="mt-2 text-gray-400">
        Send one prompt to one model to check a provider.
      </p>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <PlaygroundLoader />
      </Suspense>
    </main>
  );
}
