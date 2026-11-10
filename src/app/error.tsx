"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui";

// Styled fallback when a page throws (e.g. the database is unreachable).
// Only changes how the error looks; nothing is fetched or retried differently.
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <main className="pt-6 sm:pt-12">
      <div
        role="alert"
        className="mx-auto flex max-w-lg flex-col items-center rounded-lg border border-red-400/25 bg-red-400/[0.05] px-6 py-12 text-center"
      >
        <span className="mb-3 flex size-9 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-red-300">
          <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 10.6v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <h1 className="text-base font-semibold text-fg">Something went wrong</h1>
        <p className="mt-1 text-sm text-fg-muted">
          This page couldn&apos;t load. It may be a temporary database or
          network problem.
        </p>
        {digest && (
          <p className="mt-2 font-mono text-xs text-fg-subtle">Error ID: {digest}</p>
        )}
        <Button variant="secondary" className="mt-5" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
