import type { Metadata } from "next";
import { Suspense } from "react";
import { getAuthState } from "@/lib/auth";
import { Alert, Card, CardBody, SkeletonForm } from "@/components/ui";
import UnlockForm from "./UnlockForm";

export const metadata: Metadata = { title: "Unlock" };

async function UnlockBody({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ next }, state] = await Promise.all([searchParams, getAuthState()]);
  const nextPath = (Array.isArray(next) ? next[0] : next) ?? "/runs";

  if (state === "open") {
    return (
      <Alert tone="info">
        No APP_PASSWORD is set and this is development mode, so everything is
        already unlocked.
      </Alert>
    );
  }
  if (state === "unconfigured") {
    return (
      <Alert tone="warning">
        APP_PASSWORD is not set on the server, so uploads and runs are disabled.
        Set it in your hosting provider&apos;s environment variables and
        redeploy.
      </Alert>
    );
  }
  if (state === "unlocked") {
    return <Alert tone="success">This browser is unlocked.</Alert>;
  }
  return (
    <Card>
      <CardBody>
        <UnlockForm next={nextPath} />
      </CardBody>
    </Card>
  );
}

export default function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  return (
    <main className="mx-auto max-w-md pt-4 sm:pt-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface-raised text-fg-muted">
          <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Unlock</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
          Anyone can view results. Uploading test sets, creating prompts and
          starting runs need the shared app password.
        </p>
      </div>
      <Suspense fallback={<SkeletonForm fields={1} />}>
        <UnlockBody searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
