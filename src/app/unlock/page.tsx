import { Suspense } from "react";
import { getAuthState } from "@/lib/auth";
import UnlockForm from "./UnlockForm";

async function UnlockBody({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ next }, state] = await Promise.all([searchParams, getAuthState()]);
  const nextPath = (Array.isArray(next) ? next[0] : next) ?? "/runs";

  if (state === "open") {
    return (
      <p className="mt-6 text-gray-400">
        No APP_PASSWORD is set and this is development mode, so everything is
        already unlocked.
      </p>
    );
  }
  if (state === "unconfigured") {
    return (
      <p className="mt-6 text-yellow-400">
        APP_PASSWORD is not set on the server, so uploads and runs are disabled.
        Set it in your hosting provider&apos;s environment variables and
        redeploy.
      </p>
    );
  }
  if (state === "unlocked") {
    return <p className="mt-6 text-green-400">This browser is unlocked.</p>;
  }
  return <UnlockForm next={nextPath} />;
}

export default function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  return (
    <main>
      <h1 className="text-2xl font-bold">Unlock</h1>
      <p className="mt-2 text-gray-400">
        Anyone can view results. Uploading test sets, creating prompts and
        starting runs need the shared app password.
      </p>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <UnlockBody searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
